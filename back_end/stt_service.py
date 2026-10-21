import os
from dotenv import load_dotenv

load_dotenv()
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"
from faster_whisper import WhisperModel

whisper_model_name = os.getenv("WHISPER_MODEL", "large-v3")
print(f"[*] Dang nap mo hinh Whisper AI '{whisper_model_name}' vao RAM... Vui long cho giay lat!")
whisper_model = WhisperModel(whisper_model_name, device="cpu", compute_type="int8")
print(f"[+] Da nap thanh cong mo hinh Whisper '{whisper_model_name}'!")


def process_audio(file_path: str) -> dict:
    """
    Chuyen doi audio -> text va phan tich cac chi so noi:
    - WPM dua tren thoi gian noi that (speech_duration), khong tinh im lang
    - Dem khoang dung (pauses) giua cac segments de uoc luong fluency
    - Tinh speech_ratio (ty le thoi gian noi / tong thoi gian file)
    """
    # Materialize generator de co the duyet nhieu lan
    segments_raw, info = whisper_model.transcribe(file_path, beam_size=5, language="en")
    segments_list = list(segments_raw)

    total_duration = info.duration if info.duration > 0 else 1.0

    transcript_parts = []
    total_words = 0
    speech_duration = 0.0    # Tong thoi gian co tieng noi that
    pause_count = 0           # So khoang ngung > 0.5s giua cac segments
    long_pause_count = 0      # So khoang ngung > 1.5s (ngap ngung ro rang)
    pause_durations = []

    for i, seg in enumerate(segments_list):
        transcript_parts.append(seg.text)
        total_words += len(seg.text.split())
        seg_dur = max(0.0, seg.end - seg.start)
        speech_duration += seg_dur

        # Phat hien khoang dung giua 2 segment lien tiep
        if i > 0:
            gap = seg.start - segments_list[i - 1].end
            if gap > 0.5:           # Khoang ngung > 500ms -> co the ngap ngung
                pause_count += 1
                pause_durations.append(round(gap, 2))
            if gap > 1.5:           # > 1.5s -> ngap ngung ro rang
                long_pause_count += 1

    full_text = " ".join(transcript_parts).strip()
    speech_duration = max(speech_duration, 0.1)

    # WPM theo thoi gian noi that (loai bo im lang dau/cuoi/giua)
    speech_wpm = total_words / (speech_duration / 60)
    # speech_ratio: ty le 0.0-1.0 (1.0 = noi lien tuc, 0.5 = noi nua thoi gian)
    speech_ratio = min(1.0, speech_duration / total_duration)
    avg_pause = sum(pause_durations) / len(pause_durations) if pause_durations else 0.0

    print(
        f"[STT] {total_words} tu | speech={speech_duration:.1f}s / total={total_duration:.1f}s "
        f"| WPM={speech_wpm:.0f} | pauses={pause_count} (long={long_pause_count}) "
        f"| speech_ratio={speech_ratio:.2f}"
    )

    return {
        "text": full_text,
        "duration": round(total_duration, 2),
        "speech_duration": round(speech_duration, 2),
        "wpm": round(speech_wpm, 1),           # WPM that (khong tinh im lang)
        "pause_count": pause_count,             # So khoang ngung > 0.5s
        "long_pause_count": long_pause_count,   # So khoang ngung > 1.5s
        "speech_ratio": round(speech_ratio, 3), # Ty le noi / tong thoi gian
        "avg_pause_duration": round(avg_pause, 2),
    }