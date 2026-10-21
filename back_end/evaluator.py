import os
import sys
import json
import re
import time
import urllib.request
from typing import Any
from dotenv import load_dotenv
from openai import OpenAI
import rubric_service

# Thiết lập mã hóa UTF-8 cho console Windows tránh UnicodeEncodeError
if sys.platform == "win32":
    try:
        if hasattr(sys.stdout, "reconfigure"):
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        if hasattr(sys.stderr, "reconfigure"):
            sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

load_dotenv()

def _clean_and_parse_json(text: str) -> dict:
    """
    Trích xuất và phân tích cú pháp JSON một cách an toàn từ phản hồi của LLM.
    Xử lý các trường hợp: bọc trong markdown, thẻ <think>, dấu phẩy thừa,
    nháy đơn, ký tự xuống dòng chưa escape, hoặc phản hồi có kèm văn bản phụ.
    """
    if not text:
        return {}

    text = text.strip()

    # 1. Loại bỏ các thẻ suy nghĩ <think>...</think> nếu mô hình reasoning (Qwen, DeepSeek, v.v.) sinh ra
    text = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL).strip()

    # 2. Tìm khối markdown ```json ... ``` hoặc ``` ... ``` nếu có
    md_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', text, re.DOTALL)
    if md_match:
        text = md_match.group(1).strip()
    else:
        # Nếu mô hình chỉ bọc dấu mở/đóng ```
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()

    # 3. Tìm cặp ngoặc nhọn JSON ngoài cùng
    start_idx = text.find("{")
    end_idx = text.rfind("}")
    if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
        text = text[start_idx:end_idx + 1]

    # 4. Thử parse trực tiếp
    try:
        return json.loads(text)
    except Exception:
        pass

    # 5. Dọn dẹp các lỗi cú pháp phổ biến của LLM
    cleaned = text
    # Dọn dẹp dấu phẩy thừa trước dấu đóng ngoặc (,] hoặc ,})
    cleaned = re.sub(r',\s*([\]}])', r'\1', cleaned)
    # Thay thế nháy cong thông minh (smart quotes) sang chuẩn ASCII
    cleaned = cleaned.replace('“', '"').replace('”', '"').replace('‘', "'").replace('’', "'")
    # Xóa comment kiểu JS // ...
    cleaned = re.sub(r'//.*?\n', '\n', cleaned)
    # Thay thế giá trị boolean Python
    cleaned = re.sub(r'\bTrue\b', 'true', cleaned)
    cleaned = re.sub(r'\bFalse\b', 'false', cleaned)
    cleaned = re.sub(r'\bNone\b', 'null', cleaned)

    try:
        return json.loads(cleaned)
    except Exception:
        pass

    # 6. Fallback trích xuất bằng regex nếu JSON bị cắt cụt (truncated) hoặc sai cú pháp nặng
    recovered: dict[str, Any] = {}
    try:
        # Trích xuất overall_score
        score_m = re.search(r'"overall_score"\s*:\s*([0-9.]+)', text)
        if score_m:
            recovered["overall_score"] = float(score_m.group(1))

        # Trích xuất criteria_scores
        crit = {}
        for c in ["grammar", "vocabulary", "pronunciation", "fluency", "topic_development", "coherence"]:
            m = re.search(rf'"{c}"\s*:\s*([0-9.]+)', text, re.IGNORECASE)
            if m:
                key_name = "topic_development" if c == "coherence" else c
                crit[key_name] = float(m.group(1))
        if crit:
            recovered["criteria_scores"] = crit

        # Trích xuất model_answer
        ans_m = re.search(r'"model_answer"\s*:\s*"((?:\\.|[^"\\])*)"', text)
        if ans_m:
            recovered["model_answer"] = ans_m.group(1).replace('\\"', '"').replace('\\n', ' ')

        # Trích xuất detailed_feedback nếu có ít nhất 1 item
        fb_matches = re.findall(
            r'\{\s*"type"\s*:\s*"([^"]+)"\s*,\s*"error_text"\s*:\s*"([^"]+)"\s*,\s*"explanation"\s*:\s*"([^"]+)"\s*,\s*"correction"\s*:\s*"([^"]+)"\s*,\s*"advice"\s*:\s*"([^"]+)"\s*\}',
            text
        )
        if fb_matches:
            recovered["detailed_feedback"] = [
                {
                    "type": m[0],
                    "error_text": m[1],
                    "explanation": m[2],
                    "correction": m[3],
                    "advice": m[4]
                }
                for m in fb_matches
            ]
    except Exception:
        pass

    if recovered.get("criteria_scores") or recovered.get("overall_score"):
        return recovered

    # Không thể cứu vãn, ném exception rõ ràng
    raise ValueError(f"Không thể phân tích phản hồi JSON từ AI. Dữ liệu gốc: {text[:200]}...")


def _round_vstep_score(score: float | int | str | Any) -> float:
    """Làm tròn điểm theo chuẩn VSTEP (bước nhảy 0.5 điểm)."""
    try:
        val = round(float(score) * 2) / 2
        return max(0.0, min(10.0, val))
    except (ValueError, TypeError):
        return 0.0


def _normalize_vstep_result(
    data: dict, 
    topic: str, 
    part: str, 
    transcript: str, 
    wpm: float, 
    duration: float,
    rubric: dict | None = None
) -> dict:
    """
    Chuẩn hóa cấu trúc kết quả để đảm bảo tương thích 100% với giao diện Frontend,
    tính điểm overall theo đúng trọng số được cấu hình trong Rubric.
    """
    if not isinstance(data, dict):
        data = {}

    # 1. Chuẩn hóa criteria_scores
    raw_crit = data.get("criteria_scores", {})
    if not isinstance(raw_crit, dict):
        raw_crit = {}

    # Chuyển đổi tên trường chữ hoa sang chữ thường nếu có
    lower_crit = {str(k).lower(): v for k, v in raw_crit.items()}

    # Điểm mặc định ước lượng nếu thiếu
    default_fluency = 6.0
    if 110 <= wpm <= 160:
        default_fluency = 7.5
    elif 80 <= wpm < 110:
        default_fluency = 6.5
    elif wpm < 80:
        default_fluency = 5.0

    grammar = _round_vstep_score(lower_crit.get("grammar", 5.5))
    vocabulary = _round_vstep_score(lower_crit.get("vocabulary", 5.5))
    pronunciation = _round_vstep_score(lower_crit.get("pronunciation", 6.0))
    fluency = _round_vstep_score(lower_crit.get("fluency", default_fluency))
    topic_dev = _round_vstep_score(lower_crit.get("topic_development", lower_crit.get("coherence", 6.0)))

    criteria_scores = {
        "grammar": grammar,
        "vocabulary": vocabulary,
        "pronunciation": pronunciation,
        "fluency": fluency,
        "topic_development": topic_dev
    }

    # 2. Chuẩn hóa overall_score theo đúng trọng số cấu hình của Rubric
    overall_score = rubric_service.calculate_weighted_overall(criteria_scores, rubric)

    # 3. Chuẩn hóa detailed_feedback
    raw_feedback = data.get("detailed_feedback", [])
    detailed_feedback = []
    if isinstance(raw_feedback, list):
        for item in raw_feedback:
            if isinstance(item, dict):
                detailed_feedback.append({
                    "type": str(item.get("type", "General")),
                    "error_text": str(item.get("error_text", "")),
                    "explanation": str(item.get("explanation", "Cần cải thiện ngữ điệu và độ tự nhiên.")),
                    "correction": str(item.get("correction", "Sử dụng cấu trúc câu chuẩn.")),
                    "advice": str(item.get("advice", "Thực hành nói theo cụm từ hoàn chỉnh."))
                })

    # Nếu không có nhận xét nào, tự động thêm đánh giá độ trôi chảy
    if not detailed_feedback:
        w_cfg = rubric.get("settings", {}).get("wpm_range", {"min": 110, "max": 150}) if rubric else {"min": 110, "max": 150}
        min_w = w_cfg.get("min", 110)
        max_w = w_cfg.get("max", 150)
        detailed_feedback.append({
            "type": "Fluency",
            "error_text": f"Tốc độ: {wpm:.1f} WPM ({len(transcript.split())} từ trong {duration:.1f}s)",
            "explanation": f"Đánh giá tốc độ nói tự động. Tốc độ nói chuẩn trong cấu hình Rubric là {min_w} - {max_w} từ/phút.",
            "correction": "Duy trì nhịp nói đều đặn, phân bổ thời gian hợp lý cho từng ý.",
            "advice": "Luyện nói theo cụm ý (thought groups) để tăng tính trôi chảy và tự nhiên."
        })

    # 4. Chuẩn hóa model_answer
    model_answer = data.get("model_answer")
    if not model_answer or not str(model_answer).strip():
        model_answer = (
            f"Sample Band 9.0 Response for {part} - '{topic}': "
            "Well, when considering this issue, there are several noteworthy aspects to keep in mind. "
            "First and foremost, structuring your ideas clearly allows the listener to follow your points effortlessly. "
            "Furthermore, utilizing nuanced vocabulary and cohesive transitions will elevate your overall spoken performance."
        )

    return {
        "overall_score": overall_score,
        "criteria_scores": criteria_scores,
        "detailed_feedback": detailed_feedback,
        "model_answer": str(model_answer).strip()
    }


def _analyze_transcript_content(transcript: str) -> dict[str, float]:
    """
    Phân tích nội dung transcript để ước lượng điểm từng tiêu chí.
    Hoàn toàn chạy offline — không cần API, không tốn token.
    Trả về dict: {'grammar': float, 'vocabulary': float, 'pronunciation': float}
    """
    import string

    text = transcript.lower()
    raw_words = transcript.split()
    total_words = max(len(raw_words), 1)

    # ── 1. VOCABULARY — Phân tích vốn từ ──────────────────────────────────────
    clean_words = [w.strip(string.punctuation).lower() for w in raw_words if w.strip(string.punctuation)]
    unique_words = set(clean_words)
    type_token_ratio = len(unique_words) / total_words  # TTR: độ đa dạng từ vựng

    # Từ vựng học thuật / cấp cao (C1-B2 level indicators)
    advanced_vocab = {
        "furthermore", "moreover", "consequently", "nevertheless", "significantly",
        "particularly", "essentially", "substantially", "approximately", "ultimately",
        "demonstrate", "contribute", "emphasize", "implement", "enhance",
        "perspective", "approach", "advantage", "disadvantage", "beneficial",
        "efficient", "effective", "relevant", "crucial", "vital",
        "environment", "community", "opportunity", "challenge", "responsibility",
        "collaboration", "innovation", "sustainability", "achievement", "development",
        "influence", "perspective", "indicate", "establish", "maintain",
        "therefore", "although", "however", "whereas", "despite",
        "regarding", "concerning", "considering", "throughout", "alongside"
    }
    # Từ cơ bản quá đơn (B1 level)
    basic_vocab = {"good", "bad", "nice", "very", "really", "thing", "stuff", "like", "also", "but", "and"}

    adv_count = sum(1 for w in clean_words if w in advanced_vocab)
    basic_overuse = sum(1 for w in clean_words if w in basic_vocab)

    adv_ratio = adv_count / total_words
    basic_ratio = basic_overuse / total_words

    if adv_ratio >= 0.08 and type_token_ratio >= 0.65:
        vocab_score = 8.5
    elif adv_ratio >= 0.05 and type_token_ratio >= 0.55:
        vocab_score = 7.5
    elif adv_ratio >= 0.03 and type_token_ratio >= 0.50:
        vocab_score = 7.0
    elif type_token_ratio >= 0.45 and basic_ratio < 0.15:
        vocab_score = 6.5
    elif type_token_ratio >= 0.40:
        vocab_score = 6.0
    elif type_token_ratio >= 0.30:
        vocab_score = 5.5
    else:
        vocab_score = 4.5

    # ── 2. GRAMMAR — Phân tích cấu trúc ngữ pháp ─────────────────────────────
    # Điểm dấu câu: câu dài, đa dạng
    sentences = [s.strip() for s in re.split(r'[.!?]', transcript) if s.strip()]
    num_sentences = max(len(sentences), 1)
    avg_sent_len = total_words / num_sentences

    # Connectors cấp cao (liên kết câu phức)
    complex_connectors = [
        r'\bbecause\b', r'\balthough\b', r'\beven though\b', r'\bwhereas\b',
        r'\bsince\b', r'\bwhile\b', r'\bif\b', r'\bunless\b', r'\bwhen\b',
        r'\bwhich\b', r'\bthat\b', r'\bwho\b', r'\bwhom\b'
    ]
    connector_hits = sum(1 for pat in complex_connectors if re.search(pat, text))

    # Đa dạng thì (tense variety) — dấu hiệu ngữ pháp phong phú
    tense_markers = {
        "past_simple": [r'\b\w+ed\b', r'\bwas\b', r'\bwere\b'],
        "present_perfect": [r'\bhave\b.*\b\w+ed\b', r'\bhas\b.*\b\w+ed\b', r'\bhave been\b', r'\bhas been\b'],
        "future": [r'\bwill\b', r'\bgoing to\b', r'\bwould\b'],
        "present_cont": [r'\bam\b.*\b\w+ing\b', r'\bis\b.*\b\w+ing\b', r'\bare\b.*\b\w+ing\b'],
        "conditional": [r'\bif\b.*\bwould\b', r'\bcould\b', r'\bmight\b']
    }
    tense_variety = sum(
        1 for markers in tense_markers.values()
        if any(re.search(pat, text) for pat in markers)
    )

    # Cấu trúc câu: quá ngắn là dấu hiệu ngữ pháp đơn giản
    grammar_complexity = (connector_hits * 0.4) + (tense_variety * 0.3) + min(avg_sent_len / 20, 1.0) * 3

    if grammar_complexity >= 3.5 and tense_variety >= 3:
        grammar_score = 8.5
    elif grammar_complexity >= 2.5 and tense_variety >= 2:
        grammar_score = 7.5
    elif grammar_complexity >= 2.0:
        grammar_score = 7.0
    elif grammar_complexity >= 1.5:
        grammar_score = 6.5
    elif grammar_complexity >= 1.0:
        grammar_score = 6.0
    elif grammar_complexity >= 0.5:
        grammar_score = 5.5
    else:
        grammar_score = 4.5

    # ── 3. PRONUNCIATION — Ước lượng từ cấu trúc âm vị học ───────────────────
    # Không thể đánh giá phát âm thật từ text, nhưng có thể phân tích:
    # - Từ khó phát âm (âm tiết nhiều) → nếu xuất hiện → người nói đang thử
    # - Chuỗi từ rất ngắn → có thể đang ngập ngừng
    difficult_words = {
        "particularly", "specifically", "approximately", "comfortable", "development",
        "necessarily", "government", "environment", "international", "communication",
        "especially", "successfully", "significantly", "throughout", "temperature",
        "pronunciation", "vocabulary", "immediately", "originally", "comfortable"
    }
    difficult_used = sum(1 for w in clean_words if w in difficult_words)

    # Syllable estimate: từ dài = nhiều âm tiết = thử thách phát âm
    avg_word_len = sum(len(w) for w in clean_words) / max(len(clean_words), 1)

    if difficult_used >= 3 and avg_word_len >= 6.5:
        pronun_score = 7.5
    elif difficult_used >= 2 or avg_word_len >= 6.0:
        pronun_score = 7.0
    elif avg_word_len >= 5.0:
        pronun_score = 6.5
    elif avg_word_len >= 4.5:
        pronun_score = 6.0
    else:
        pronun_score = 5.5

    # ── 4. TOPIC DEVELOPMENT & COHERENCE (Bố cục nội dung & Liên kết) ─────────
    cohesion_markers = {
        "addition": [r'\bfurthermore\b', r'\bmoreover\b', r'\bin addition\b', r'\bbesides\b', r'\balso\b'],
        "contrast": [r'\bhowever\b', r'\bon the other hand\b', r'\balthough\b', r'\beven though\b', r'\bwhereas\b', r'\bnevertheless\b', r'\bbut\b'],
        "cause_effect": [r'\bbecause\b', r'\btherefore\b', r'\bas a result\b', r'\bconsequently\b', r'\bsince\b', r'\bso\b'],
        "example": [r'\bfor example\b', r'\bfor instance\b', r'\bsuch as\b', r'\bto illustrate\b'],
        "conclusion": [r'\bin conclusion\b', r'\bto sum up\b', r'\bin summary\b', r'\ball in all\b', r'\bfinally\b']
    }
    cohesion_diversity = sum(
        1 for markers in cohesion_markers.values()
        if any(re.search(pat, text) for pat in markers)
    )
    total_cohesion_hits = sum(
        len(re.findall(pat, text))
        for markers in cohesion_markers.values()
        for pat in markers
    )

    # Đánh giá theo chuẩn Barem Bộ GD&ĐT (0-10):
    if total_words >= 80 and cohesion_diversity >= 4 and total_cohesion_hits >= 5:
        topic_dev_score = 8.5
    elif total_words >= 60 and cohesion_diversity >= 3 and total_cohesion_hits >= 3:
        topic_dev_score = 7.5
    elif total_words >= 45 and cohesion_diversity >= 2:
        topic_dev_score = 6.5
    elif total_words >= 30 and total_cohesion_hits >= 2:
        topic_dev_score = 5.5
    elif total_words >= 20:
        topic_dev_score = 4.5
    elif total_words >= 10:
        topic_dev_score = 3.5
    else:
        topic_dev_score = 2.0

    return {
        "grammar": round(grammar_score, 1),
        "vocabulary": round(vocab_score, 1),
        "pronunciation": round(pronun_score, 1),
        "topic_development": round(topic_dev_score, 1),
        # Metadata để dùng trong feedback
        "_type_token_ratio": round(type_token_ratio, 3),
        "_adv_vocab_count": adv_count,
        "_tense_variety": tense_variety,
        "_connector_hits": connector_hits,
        "_avg_sent_len": round(avg_sent_len, 1),
        "_cohesion_diversity": cohesion_diversity,
        "_cohesion_hits": total_cohesion_hits
    }


def _create_offline_mock(
    topic: str, 
    part: str, 
    transcript: str, 
    wpm: float, 
    duration: float, 
    reason: str = "",
    rubric: dict | None = None,
    pause_count: int = 0,
    long_pause_count: int = 0,
    speech_ratio: float = 1.0,
) -> dict:
    """
    Tạo kết quả đánh giá thông minh dựa trên phân tích nội dung transcript thật.
    Hoàn toàn offline — không cần API key, không tốn token.
    Mỗi bài nói khác nhau sẽ cho điểm khác nhau theo đúng rubric.
    """
    words = len(transcript.split())

    w_cfg = rubric.get("settings", {}).get("wpm_range", {"min": 110, "max": 150}) if rubric else {"min": 110, "max": 150}
    min_w = w_cfg.get("min", 110)
    max_w = w_cfg.get("max", 150)

    # ── Fluency: dựa theo WPM thực tế so với ngưỡng Rubric ───────────────────
    if min_w <= wpm <= max_w:
        fluency = 8.0
        fluency_note = f"Tốc độ nói rất tốt ({wpm:.0f} WPM), chuẩn ngưỡng VSTEP ({min_w}–{max_w} WPM)."
    elif (min_w - 20) <= wpm < min_w:
        fluency = 6.5
        fluency_note = f"Tốc độ hơi chậm ({wpm:.0f} WPM so với chuẩn {min_w}–{max_w} WPM), nhưng rõ ràng, dễ nghe."
    elif wpm < (min_w - 20):
        fluency = _round_vstep_score(max(3.5, 3.5 + (wpm / min_w) * 3.0))
        fluency_note = f"Tốc độ quá chậm ({wpm:.0f} WPM). Cần luyện tăng tốc độ phản xạ ngôn ngữ."
    elif wpm > max_w + 20:
        fluency = 6.0
        fluency_note = f"Tốc độ quá nhanh ({wpm:.0f} WPM). Cần ngắt nghỉ tự nhiên và nhả chữ rõ hơn."
    else:
        fluency = 7.0
        fluency_note = f"Tốc độ khá ({wpm:.0f} WPM), gần đạt chuẩn VSTEP."

    # Phạt fluency thêm nếu thời gian dài nhưng nói quá ít (dấu hiệu ấp úng/không nói được)
    if duration > 30 and words < 15:
        fluency = max(3.0, fluency - 1.5)
        fluency_note += f" Bài nói quá ngắn so với thời lượng ({words} từ / {duration:.0f}s)."
    elif duration > 30 and words < 25:
        fluency = max(3.5, fluency - 0.5)

    # Phạt fluency theo pause analysis (từ STT)
    if long_pause_count >= 5:
        fluency = max(3.0, fluency - 2.0)
        fluency_note += f" Phát hiện {long_pause_count} lần ngập ngừng dài (>1.5s) — ảnh hưởng nhiều đến độ trôi chảy."
    elif long_pause_count >= 3:
        fluency = max(3.5, fluency - 1.0)
        fluency_note += f" {long_pause_count} lần ngập ngừng dài (>1.5s) làm giảm độ liên tục."
    elif long_pause_count >= 1:
        fluency = max(4.0, fluency - 0.5)
        fluency_note += f" {long_pause_count} ngập ngừng dài nhẹ."

    # Phạt nếu speech ratio thấp (nói ít trong tổng thời gian)
    if speech_ratio < 0.50:
        fluency = max(3.0, fluency - 1.5)
        fluency_note += f" Chỉ nói {speech_ratio:.0%} thời gian ghi âm — có nhiều khoảng dừng dài."
    elif speech_ratio < 0.65:
        fluency = max(3.5, fluency - 0.5)
        fluency_note += f" Speech ratio thấp ({speech_ratio:.0%}) — nên nói liên tục hơn."

    fluency = _round_vstep_score(fluency)

    # ── Grammar, Vocabulary, Pronunciation: phân tích nội dung transcript ─────
    content_analysis = _analyze_transcript_content(transcript)
    grammar = _round_vstep_score(content_analysis["grammar"])
    vocab = _round_vstep_score(content_analysis["vocabulary"])
    pronun = _round_vstep_score(content_analysis["pronunciation"])
    topic_dev = _round_vstep_score(content_analysis.get("topic_development", 6.0))

    ttr = content_analysis["_type_token_ratio"]
    adv_count = content_analysis["_adv_vocab_count"]
    tense_var = content_analysis["_tense_variety"]
    conn_hits = content_analysis["_connector_hits"]
    avg_slen = content_analysis["_avg_sent_len"]
    cohesion_div = content_analysis.get("_cohesion_diversity", 0)

    criteria = {
        "grammar": grammar,
        "vocabulary": vocab,
        "pronunciation": pronun,
        "fluency": fluency,
        "topic_development": topic_dev
    }
    overall = rubric_service.calculate_weighted_overall(criteria, rubric)

    # ── Feedback thông minh theo kết quả phân tích ────────────────────────────
    feedback_items = []

    # Feedback Fluency
    feedback_items.append({
        "type": "Fluency",
        "error_text": f"Tốc độ: {wpm:.1f} WPM — {words} từ trong {duration:.1f}s",
        "explanation": f"{fluency_note} Chuẩn VSTEP: {min_w}–{max_w} WPM.",
        "correction": "Luyện nói với timer để đạt tốc độ mục tiêu đều đặn.",
        "advice": "Nói theo cụm ý (thought groups), không ngừng giữa từng từ đơn lẻ."
    })

    # Feedback Vocabulary — dựa theo TTR và từ nâng cao
    if ttr < 0.40:
        feedback_items.append({
            "type": "Vocabulary",
            "error_text": f"Lặp từ nhiều — chỉ {len(set(transcript.lower().split()))} từ duy nhất / {words} từ (TTR: {ttr:.0%})",
            "explanation": "Bài nói lặp lại nhiều từ giống nhau — dấu hiệu vốn từ hạn chế (B1).",
            "correction": "Thay thế bằng từ đồng nghĩa, collocation và từ học thuật phù hợp.",
            "advice": "Học từ theo chủ đề VSTEP (topic-based vocabulary) và luyện paraphrasing."
        })
    elif adv_count == 0:
        feedback_items.append({
            "type": "Vocabulary",
            "error_text": "Chưa dùng từ vựng học thuật hoặc nâng cao",
            "explanation": f"Bài nói chỉ dùng từ cơ bản (TTR: {ttr:.0%}). Thiếu từ B2-C1 như 'furthermore', 'significantly', 'contribute'.",
            "correction": "Cố gắng dùng ít nhất 2-3 từ nâng cao hoặc connectors cấp cao mỗi bài.",
            "advice": "Học danh sách Academic Word List (AWL) và luyện dùng tự nhiên trong câu."
        })
    elif adv_count >= 3:
        feedback_items.append({
            "type": "Vocabulary",
            "error_text": f"Tốt: Đã dùng {adv_count} từ học thuật/nâng cao",
            "explanation": f"Vốn từ đa dạng tốt (TTR: {ttr:.0%}). Tiếp tục mở rộng sang collocations và idioms.",
            "correction": "Đảm bảo dùng từ đúng ngữ cảnh, không chỉ nhồi từ khó.",
            "advice": "Học thêm academic collocations (ví dụ: 'play a crucial role', 'have a significant impact')."
        })

    # Feedback Grammar — dựa theo tense variety và connectors
    if tense_var <= 1:
        feedback_items.append({
            "type": "Grammar",
            "error_text": f"Câu đơn điệu — chỉ phát hiện {tense_var} loại thì",
            "explanation": f"Bài nói thiếu đa dạng thì (tense variety). Cấu trúc câu quá đơn giản (avg {avg_slen:.0f} từ/câu).",
            "correction": "Kết hợp Present Perfect, Past Simple, và Conditional để câu phong phú hơn.",
            "advice": "Luyện kể chuyện có quá khứ → hiện tại → tương lai để tự nhiên dùng nhiều thì."
        })
    elif conn_hits < 3:
        feedback_items.append({
            "type": "Grammar",
            "error_text": "Thiếu liên từ phức (complex connectors)",
            "explanation": f"Chỉ phát hiện {conn_hits} liên từ/mệnh đề phụ. Câu thiếu sự liên kết logic.",
            "correction": "Thêm 'because', 'although', 'which', 'whereas' để tạo câu phức tự nhiên.",
            "advice": "Mỗi ý chính nên có ít nhất 1 câu phức (complex sentence) để thể hiện ngữ pháp B2+."
        })

    # Feedback Topic Development & Coherence (Bố cục nội dung theo barem Bộ GD&ĐT)
    if cohesion_div < 2:
        feedback_items.append({
            "type": "Topic Development",
            "error_text": "Liên kết ý đơn điệu — thiếu từ nối chuyển đoạn",
            "explanation": "Theo barem VSTEP, bài nói Bậc 4-5 cần sử dụng đa dạng phương tiện liên kết (addition, contrast, cause/effect, example) để thể hiện rõ quan hệ giữa các ý.",
            "correction": "Bổ sung các liên từ: 'Furthermore', 'On the other hand', 'For instance', 'As a result'.",
            "advice": "Tổ chức câu trả lời theo 3 phần: Câu mở đầu trực tiếp → 2 luận điểm mở rộng kèm ví dụ → Kết luận tóm lược."
        })
    else:
        feedback_items.append({
            "type": "Topic Development",
            "error_text": f"Tốt: Đã sử dụng {content_analysis.get('_cohesion_hits', 0)} từ liên kết ý",
            "explanation": f"Bài nói có tính mạch lạc tương đối ({cohesion_div} nhóm liên từ). Tiếp tục làm sâu sắc thêm các ví dụ minh họa.",
            "correction": "Đưa thêm các dẫn chứng cụ thể từ trải nghiệm cá nhân để đạt điểm tối đa Bố cục.",
            "advice": "Áp dụng kỹ thuật P.E.E.L (Point, Explanation, Example, Link) cho mỗi ý trình bày."
        })

    # Giới hạn feedback theo rubric settings
    settings = rubric.get("settings", {}) if rubric else {}
    max_items = settings.get("max_feedback_items", 4)
    feedback_items = feedback_items[:max(3, max_items)]

    # Luôn thêm note Offline mode vào item cuối cùng
    feedback_items.append({
        "type": "Thông báo hệ thống",
        "error_text": "⚠️ Chế độ phân tích Offline (LM Studio chưa kết nối)",
        "explanation": (
            f"LM Studio chưa chạy ({reason or 'Connection refused'}). "
            "Điểm trên được tính bằng thuật toán phân tích văn bản — khác nhau theo từng bài nói."
        ),
        "correction": "Để có điểm AI chính xác: mở LM Studio → chọn model → nhấn Start Server.",
        "advice": "Sau khi kết nối LM Studio, thu âm lại để nhận phân tích chi tiết từng lỗi."
    })

    model_answer = (
        f"[Offline Mode] Band 9.0 sample for {part} – '{topic}': "
        "Well, this is a thought-provoking topic. From my perspective, the most significant aspect is "
        "how it affects people's daily lives. Furthermore, although there are challenges involved, "
        "the long-term benefits substantially outweigh the drawbacks, particularly when communities "
        "collaborate effectively to address them."
    )

    return {
        "overall_score": overall,
        "criteria_scores": criteria,
        "detailed_feedback": feedback_items,
        "model_answer": model_answer
    }


def _get_active_lm_studio_model(base_url: str, default_model: str) -> str:
    """Truy vấn danh sách model đang nạp trong LM Studio để đảm bảo dùng đúng tên model."""
    try:
        url = f"{base_url.rstrip('/')}/models"
        req = urllib.request.Request(url, headers={"User-Agent": "VSTEP-Pro/1.0"})
        with urllib.request.urlopen(req, timeout=3) as resp:
            if resp.status == 200:
                data = json.loads(resp.read().decode("utf-8"))
                models = [m.get("id") for m in data.get("data", []) if m.get("id")]
                if default_model in models:
                    return default_model
                # Tìm model text/LLM (bỏ qua whisper và embedding)
                llm_models = [m for m in models if "whisper" not in m.lower() and "embed" not in m.lower()]
                if llm_models:
                    return llm_models[0]
                if models:
                    return models[0]
    except Exception:
        pass
    return default_model


def _evaluate_with_lm_studio(
    topic: str, 
    part: str, 
    transcript: str, 
    wpm: float, 
    duration: float, 
    prompt: str,
    rubric: dict | None = None
) -> dict:
    """Gọi LM Studio qua OpenAI-compatible API với hỗ trợ timeout và auto-detect model."""
    configured_url = os.getenv("LM_STUDIO_BASE_URL", "http://127.0.0.1:1234/v1").strip()
    # Timeout dài hơn vì Qwen 14B cần 3-8 phút để generate trên CPU
    LM_TIMEOUT = float(os.getenv("LM_STUDIO_TIMEOUT", "600"))  # 10 phút mặc định

    # Hỗ trợ tự động fallback giữa 127.0.0.1 và localhost trên Windows
    urls_to_try = [configured_url]
    if "localhost" in configured_url:
        urls_to_try.append(configured_url.replace("localhost", "127.0.0.1"))
    elif "127.0.0.1" in configured_url:
        urls_to_try.append(configured_url.replace("127.0.0.1", "localhost"))

    model_configured = os.getenv("QWEN_MODEL", "qwen2.5-14b-instruct-1m").strip()
    temperature_val = float(os.getenv("TEMPERATURE", "0.2"))

    last_error = None
    for base_url in urls_to_try:
        try:
            model_name = _get_active_lm_studio_model(base_url, model_configured)
            print(f"[LM Studio] Dang goi model '{model_name}' tai {base_url} (timeout={LM_TIMEOUT:.0f}s)...")
            client = OpenAI(base_url=base_url, api_key="lm-studio", timeout=LM_TIMEOUT)

            response = client.chat.completions.create(
                model=model_name,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an official VSTEP Speaking Examiner. Output strictly valid JSON matching the requested schema. No commentary, no think tags."
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=temperature_val,
                max_tokens=700
            )

            raw_text = ""
            if response.choices and response.choices[0].message and response.choices[0].message.content:
                raw_text = response.choices[0].message.content.strip()

            print(f"[LM Studio] Nhan duoc phan hoi ({len(raw_text)} ky tu). Dang phan tich...")
            parsed = _clean_and_parse_json(raw_text)
            result = _normalize_vstep_result(parsed, topic, part, transcript, wpm, duration, rubric=rubric)
            print(f"[LM Studio] Cham diem xong! Overall: {result.get('overall_score')}")
            return result

        except Exception as e:
            last_error = e
            err_str = str(e)
            # Lỗi kết nối → thử URL tiếp theo
            if "Connection error" in err_str or "ConnectError" in err_str or "refused" in err_str:
                print(f"[LM Studio] Khong ket noi duoc voi {base_url}, thu URL tiep theo...")
                continue
            # Lỗi timeout → thông báo rõ ràng (không rơi sang Offline Mock âm thầm)
            if "timeout" in err_str.lower() or "Timeout" in err_str or "timed out" in err_str.lower():
                print(f"[LM Studio] TIMEOUT sau {LM_TIMEOUT:.0f}s! Model qua chay cham. Tang LM_STUDIO_TIMEOUT trong .env.")
                raise Exception(f"LM Studio timeout sau {LM_TIMEOUT:.0f}s. Tang bien LM_STUDIO_TIMEOUT trong .env.")
            # Lỗi khác (parse, v.v.) → ném ra ngoài
            print(f"[LM Studio] Loi khac: {err_str[:200]}")
            raise e

    if last_error:
        raise last_error
    raise Exception(f"Khong the ket noi den may chu LM Studio tai {configured_url}")


def _evaluate_with_gemini(
    topic: str, 
    part: str, 
    transcript: str, 
    wpm: float, 
    duration: float, 
    prompt: str,
    rubric: dict | None = None
) -> dict | None:
    """Gọi Google Gemini API nếu có cấu hình GEMINI_API_KEY trong .env."""
    gemini_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not gemini_key or gemini_key == "your_gemini_api_key_here":
        return None

    try:
        import google.generativeai as genai
    except ImportError:
        return None

    genai.configure(api_key=gemini_key)
    model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash").strip()
    
    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content(
            prompt,
            generation_config={"temperature": 0.2, "max_output_tokens": 1000}
        )
        raw_text = response.text if response and hasattr(response, "text") else ""
        parsed = _clean_and_parse_json(raw_text)
        return _normalize_vstep_result(parsed, topic, part, transcript, wpm, duration, rubric=rubric)

    except Exception as e:
        err_str = str(e)
        if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str or "quota" in err_str.lower():
            raise Exception("429_RATE_LIMIT")
        raise e


def _apply_score_adjustments(
    res: dict, 
    transcript: str, 
    wpm: float,
    duration: float,
    speech_ratio: float, 
    pause_count: int, 
    long_pause_count: int,
    rubric: dict | None = None
) -> dict:
    """
    TƯỚC QUYỀN chấm Fluency và Pronunciation của AI.
    - AI chỉ chấm Grammar và Vocab (vì nó giỏi phân tích Text).
    - Code Python sẽ tự tính Fluency cứng dựa trên WPM thực tế của âm thanh.
    - Pronunciation được nội suy từ Fluency và Vocabulary.
    """
    words = len(transcript.split())
    
    crit = res.get("criteria_scores", {})
    grammar = crit.get("grammar", 5.0)
    vocab = crit.get("vocabulary", 5.0)
    pronun = crit.get("pronunciation", 5.0)
    fluency = crit.get("fluency", 5.0)
    
    # 1. Tính toán Tốc độ nói THỰC TẾ (Effective WPM) - Phạt nặng nếu im lặng nhiều
    # Tránh việc học sinh im lặng 50s, nói 1 câu 10s rồi được tính WPM cao.
    effective_wpm = (words / duration) * 60 if duration > 0 else 0
    
    # 2. Thuật toán chốt hạ Fluency theo WPM
    if effective_wpm < 50:
        fluency = 2.0
    elif effective_wpm < 80:
        fluency = 3.5
    elif effective_wpm < 100:
        fluency = 5.0
    elif effective_wpm < 120:
        fluency = 6.5
    elif effective_wpm < 140:
        fluency = 8.0
    elif effective_wpm < 155:
        fluency = 9.0
    else:
        fluency = 10.0

    # Phạt Fluency nếu ngập ngừng dài (long_pause_count) quá nhiều so với số từ
    if words > 30:
        if long_pause_count >= 5:
            fluency = max(3.0, fluency - 1.5)
        elif long_pause_count >= 3:
            fluency = max(3.5, fluency - 0.5)

    # 3. Chống Whisper "Tẩy trắng" (Bleaching Penalty) cho bài kém
    # Nếu nói quá chậm (< 80), mọi ngữ pháp hoàn hảo trong Text đều là do AI tự sửa.
    if effective_wpm < 80:
        grammar = min(grammar, fluency + 0.5)
        vocab = min(vocab, fluency + 0.5)

    # 4. Bù trừ độ khắt khe của AI (Strictness Compensator) cho bài giỏi
    # Văn nói thực tế hiếm khi dùng từ vựng C2 hay ngữ pháp hoàn hảo như AI kỳ vọng.
    # Nếu WPM cao chứng tỏ phản xạ rất tốt, phải vớt Grammar/Vocab lên.
    if fluency >= 6.5:
        grammar = max(grammar, fluency - 1.5)
        vocab = max(vocab, fluency - 1.0)

    # 5. Khóa Pronunciation xoay quanh Fluency (70%) và Vocabulary (30%)
    pronun = (fluency * 0.7) + (vocab * 0.3)
    topic_dev = crit.get("topic_development", crit.get("coherence", 6.0))

    res["criteria_scores"]["grammar"] = _round_vstep_score(grammar)
    res["criteria_scores"]["vocabulary"] = _round_vstep_score(vocab)
    res["criteria_scores"]["pronunciation"] = _round_vstep_score(pronun)
    res["criteria_scores"]["fluency"] = _round_vstep_score(fluency)
    res["criteria_scores"]["topic_development"] = _round_vstep_score(topic_dev)
    res["overall_score"] = rubric_service.calculate_weighted_overall(res["criteria_scores"], rubric)
        
    return res


def evaluate_vstep(
    topic: str,
    part: str,
    transcript: str,
    wpm: float,
    duration: float,
    speech_duration: float = 0.0,
    pause_count: int = 0,
    long_pause_count: int = 0,
    speech_ratio: float = 1.0,
    avg_pause_duration: float = 0.0,
) -> dict:
    """
    Đánh giá bài nói VSTEP đa nền tảng kết hợp Rubric tùy chỉnh động.
    Nhận thêm các chỉ số từ STT (pause_count, speech_ratio) để chấm
    Fluency và Pronunciation chính xác hơn.
    """
    if speech_duration <= 0:
        speech_duration = duration

    # 1. Nạp Rubric tùy chỉnh đang hoạt động
    active_rubric = rubric_service.get_active_rubric()
    rubric_instructions = rubric_service.build_rubric_prompt_instructions(active_rubric)
    settings = active_rubric.get("settings", {})
    feedback_lang = settings.get("feedback_language", "vi")
    lang_name = "tiếng Việt" if feedback_lang == "vi" else "English"
    max_feedback = settings.get("max_feedback_items", 3)

    # 2. Nếu bài nói quá ngắn hoặc không có âm thanh
    if not transcript or len(transcript.strip()) < 5:
        return {
            "overall_score": 0.0,
            "criteria_scores": {
                "grammar": 0.0,
                "vocabulary": 0.0,
                "pronunciation": 0.0,
                "fluency": 0.0,
                "topic_development": 0.0
            },
            "detailed_feedback": [],
            "model_answer": "Không có dữ liệu bài nói để đánh giá. Vui lòng thử lại và nói rõ ràng vào micro."
        }

    # 3. Xây dựng prompt chấm điểm VSTEP động theo Rubric
    fluency_data = (
        f"Speech rate: {wpm:.1f} WPM (speaking time: {speech_duration:.1f}s / total: {duration:.1f}s). "
        f"Total word count: {len(transcript.split())} words."
    )

    prompt = f"""You are an official VSTEP Speaking Examiner. Evaluate the candidate OBJECTIVELY based on the Ministry of Education VSTEP Speaking Rubric (Grade 0 - 10).

{rubric_instructions}

EXAM DETAILS:
- Part: {part}
- Topic: {topic}
- Candidate Transcript: "{transcript}"

INSTRUCTIONS:
1. Score Grammar, Vocabulary, and Topic Development (Bố cục nội dung) on a 0.0 - 10.0 scale based on the QUALITY and COHERENCE of the transcript according to the official VSTEP Rubric.
2. DO NOT score Fluency or Pronunciation (these are measured from audio acoustics).
3. Score EACH criterion INDEPENDENTLY.
4. overall_score = weighted average across all criteria, rounded to nearest 0.5.
5. Provide {max_feedback} feedback items in {lang_name} covering Grammar, Vocabulary, and Topic Development.
6. Return ONLY valid JSON. No markdown, no extra text.

{{
    "overall_score": 0.0,
    "criteria_scores": {{
        "grammar": 0.0,
        "vocabulary": 0.0,
        "pronunciation": 0.0,
        "fluency": 0.0,
        "topic_development": 0.0
    }},
    "detailed_feedback": [
        {{
            "type": "Grammar",
            "error_text": "exact phrase from transcript",
            "explanation": "brief explanation in {lang_name}",
            "correction": "natural correction",
            "advice": "actionable tip"
        }}
    ],
    "model_answer": "Natural high-band sample answer for this exact topic in English"
}}"""

    errors = []

    # 4. Thử chấm điểm qua LM Studio trước
    try:
        res = _evaluate_with_lm_studio(topic, part, transcript, wpm, duration, prompt, rubric=active_rubric)
        return _apply_score_adjustments(res, transcript, wpm, duration, speech_ratio, pause_count, long_pause_count, active_rubric)
    except Exception as e:
        err_str = str(e)
        errors.append(f"LM Studio: {err_str}")

    # 5. Nếu LM Studio thất bại, thử Google Gemini (nếu có key)
    try:
        gemini_res = _evaluate_with_gemini(topic, part, transcript, wpm, duration, prompt, rubric=active_rubric)
        if gemini_res:
            return _apply_score_adjustments(gemini_res, transcript, wpm, duration, speech_ratio, pause_count, long_pause_count, active_rubric)
    except Exception as e:
        err_str = str(e)
        if "429_RATE_LIMIT" in err_str:
            raise
        errors.append(f"Gemini: {err_str}")

    # 6. Kiểm tra chế độ kiểm thử Offline Mock
    allow_mock = os.getenv("ALLOW_OFFLINE_MOCK", "True").strip().lower() in ("true", "1", "yes")
    if allow_mock:
        error_summary = "; ".join(errors)
        return _create_offline_mock(
            topic, part, transcript, wpm, duration,
            reason=error_summary, rubric=active_rubric,
            pause_count=pause_count,
            long_pause_count=long_pause_count,
            speech_ratio=speech_ratio,
        )

    # 7. Nếu không cho phép mock, báo lỗi chi tiết
    lm_base_url = os.getenv("LM_STUDIO_BASE_URL", "http://127.0.0.1:1234/v1")
    error_detail = "; ".join(errors)
    if "Connection error" in error_detail or "ConnectError" in error_detail or "refused" in error_detail:
        raise Exception(
            f"Không thể kết nối đến máy chủ AI (LM Studio tại {lm_base_url}). "
            "Vui lòng mở LM Studio và nhấn 'Start Server'."
        )
    raise Exception(f"Lỗi khi xử lý bài thi qua AI: {error_detail}")

