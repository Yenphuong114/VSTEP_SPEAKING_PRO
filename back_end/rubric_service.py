import os
import json
import tempfile
from typing import Any

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RUBRIC_CONFIG_PATH = os.path.join(BASE_DIR, "rubric_config.json")

# ==============================================================================
# BAREM CHUẨN CHÍNH THỨC CỦA BỘ GIÁO DỤC & ĐÀO TẠO — VSTEP NÓI BẬC 3-5
# Gồm 5 tiêu chí độc lập x Thang điểm chi tiết 0 đến 10
# ==============================================================================
OFFICIAL_VSTEP_RUBRIC_VI: dict[str, Any] = {
    "version": "2.0",
    "name": "Barem Tiêu Chí Chấm Điểm Bài Thi Nói VSTEP – Bậc 3-5 (Bộ GD&ĐT)",
    "description": "Barem chấm thi Nói VSTEP chính thức của Bộ GD&ĐT gồm 5 tiêu chí độc lập: Ngữ pháp, Từ vựng, Phát âm, Độ lưu loát, Bố cục nội dung theo thang điểm 0-10.",
    "settings": {
        "examiner_strictness": "standard",  # "strict", "standard", "lenient"
        "feedback_language": "vi",          # "vi", "en"
        "max_feedback_items": 4,
        "wpm_range": {
            "min": 110,
            "max": 150
        }
    },
    "criteria": {
        "grammar": {
            "name": "Ngữ pháp (Grammar)",
            "sub_criteria": "Phạm vi & Độ chính xác",
            "weight": 0.20,
            "description": "Đa dạng cấu trúc câu đơn/phức, mức độ chính xác, khả năng kiểm soát lỗi và tự sửa lỗi.",
            "band_descriptors": {
                "0": "Thí sinh không dự thi.",
                "1": "Chỉ sử dụng được một cách hạn chế một số cấu trúc ngữ pháp và mẫu câu đơn giản đã học.",
                "2": "Sử dụng chính xác một số cấu trúc đơn giản nhưng vẫn mắc các lỗi cơ bản một cách hệ thống; tuy nhiên, người sử dụng vẫn thể hiện được ý mình muốn truyền đạt.",
                "3": "Sử dụng một cách khá chính xác các dạng câu đơn thường dùng trong những tình huống quen thuộc, tuy có thể còn mắc nhiều lỗi nhưng người sử dụng vẫn thể hiện được ý một cách rõ ràng.",
                "4": "Sử dụng một cách chính xác các dạng câu đơn thường dùng trong những tình huống quen thuộc, tuy có thể còn mắc một số lỗi nhưng người sử dụng vẫn thể hiện được ý một cách rõ ràng.",
                "5": "Sử dụng một cách chính xác các dạng câu đơn thường dùng trong những tình huống quen thuộc, tuy có thể còn mắc một số lỗi nhưng người sử dụng vẫn thể hiện được ý một cách rõ ràng. Có nỗ lực sử dụng những mẫu câu phức tuy còn mắc nhiều lỗi.",
                "6": "Sử dụng linh hoạt và chính xác câu đơn và một số câu phức, tuy còn mắc một số lỗi sai nhưng không dẫn đến hiểu nhầm.",
                "7": "Sử dụng linh hoạt và chính xác câu đơn và khá nhiều câu phức, tuy còn mắc một số lỗi sai trong diễn đạt một cách không hệ thống.",
                "8": "Sử dụng linh hoạt và chính xác câu đơn và khá nhiều câu phức, tuy còn mắc một số lỗi sai nhưng có thể tự sửa được ngay.",
                "9": "Sử dụng linh hoạt và chính xác nhiều cấu trúc câu đa dạng, tuy đôi khi còn mắc lỗi nhưng khó phát hiện.",
                "10": "Sử dụng linh hoạt và chính xác nhiều cấu trúc câu đa dạng và hầu như không mắc lỗi."
            }
        },
        "vocabulary": {
            "name": "Từ vựng (Vocabulary)",
            "sub_criteria": "Phạm vi & Kiểm soát",
            "weight": 0.20,
            "description": "Vốn từ vựng, độ chính xác ngữ cảnh, tránh lặp từ, sử dụng idioms, collocations và cách diễn đạt khác.",
            "band_descriptors": {
                "0": "Thí sinh không dự thi.",
                "1": "Chỉ sử dụng được một số từ, cụm từ riêng lẻ về một số chủ đề rất quen thuộc.",
                "2": "Sử dụng được nhiều từ, cụm từ đơn giản về các chủ đề rất quen thuộc. Chọn đúng từ và dạng thức của từ thuộc phạm vi từ nêu trên.",
                "3": "Sử dụng được các từ vựng thuộc các chủ đề quen thuộc mặc dù thường xuyên lặp từ.",
                "4": "Sử dụng được các từ vựng thuộc các chủ đề quen thuộc và đôi lúc còn dùng lặp các từ vựng này. Có nỗ lực sử dụng từ vựng thuộc các chủ đề không quen thuộc nhưng còn mắc nhiều lỗi về dùng từ.",
                "5": "Sử dụng được các từ vựng thuộc các chủ đề quen thuộc và đôi lúc còn dùng lặp các từ vựng này. Có nỗ lực sử dụng từ vựng thuộc các chủ đề không quen thuộc nhưng còn mắc một số lỗi về dùng từ.",
                "6": "Sử dụng được các từ vựng thuộc về hầu hết các chủ đề quen thuộc và đôi lúc có nỗ lực tránh lặp từ khi sử dụng các từ vựng thuộc các chủ đề không quen thuộc. Có độ chính xác từ vựng tương đối cao tuy vẫn còn lỗi về dùng từ và dạng thức từ.",
                "7": "Sử dụng được các từ vựng thuộc về hầu hết các chủ đề quen thuộc và có nỗ lực tránh lặp từ với khi sử dụng các từ vựng thuộc các chủ đề không quen thuộc. Có độ chính xác từ vựng khá cao mặc dù vẫn lúng túng khi chọn từ và đôi lúc dùng từ còn sai.",
                "8": "Sử dụng được các từ vựng thuộc về hầu hết các chủ đề quen thuộc và rất nỗ lực tránh lặp từ khi sử dụng các từ vựng thuộc các chủ đề không quen thuộc. Có nỗ lực trong việc sử dụng những từ ít quen thuộc và những cách diễn đạt kiểu thành ngữ. Có độ chính xác từ vựng khá cao mặc dù vẫn lúng túng khi chọn từ và đôi lúc dùng từ còn sai.",
                "9": "Có lượng từ vựng lớn, gồm cả các từ không quen thuộc, các cách diễn đạt kiểu thành ngữ và lối nói thông tục. Chủ động tìm những cách diễn đạt khác và/hoặc các cách nói tránh tuy đôi lúc còn ngập ngừng. Đôi khi vẫn lỡ lời và vẫn mắc một vài lỗi từ vựng nhỏ.",
                "10": "Có lượng từ vựng lớn, gồm cả các từ không quen thuộc, các cách diễn đạt kiểu thành ngữ và lối nói thông tục. Chủ động tìm những cách diễn đạt khác và/hoặc các cách nói tránh mà hầu như không ngập ngừng. Hầu như không lỡ lời và không mắc những lỗi từ vựng nhỏ."
            }
        },
        "pronunciation": {
            "name": "Phát âm (Pronunciation)",
            "sub_criteria": "Âm đơn lẻ, Trọng âm, Ngữ điệu",
            "weight": 0.20,
            "description": "Phát âm âm đơn lẻ, trọng âm từ, trọng âm câu và ngữ điệu thể hiện sắc thái ý nghĩa.",
            "band_descriptors": {
                "0": "Thí sinh không dự thi.",
                "1": "Phát âm được những từ và cụm từ rất đơn giản nhưng độ chính xác thấp, gây khó hiểu cho người nghe.",
                "2": "Phát âm tương đối rõ ràng những từ và cụm từ đơn giản nhưng do đôi khi khó nghe nên người đối thoại vẫn phải yêu cầu nhắc lại.",
                "3": "Phát âm rõ ràng và dễ hiểu những từ và cụm từ, tuy còn mắc khá nhiều lỗi về các âm đơn lẻ và các lỗi về âm khác.",
                "4": "Phát âm rõ ràng và dễ hiểu những từ và cụm từ, tuy đôi khi còn mắc lỗi về các âm đơn lẻ. Có cố gắng nhấn trọng âm từ tuy còn sai nhiều.",
                "5": "Phát âm rõ ràng và dễ hiểu những từ và cụm từ, tuy đôi khi còn mắc một số lỗi về các âm đơn lẻ. Có cố gắng nhấn trọng âm từ tuy còn chưa chính xác.",
                "6": "Phát âm rõ ràng, tự nhiên, và dễ hiểu. Phát âm đơn lẻ hầu như rõ ràng, chính xác. Nhấn trọng âm từ tương đối chính xác và đã thể hiện sự nỗ lực trong việc nhấn trọng âm câu và ngữ điệu câu.",
                "7": "Phát âm rõ ràng, tự nhiên, và dễ hiểu. Phát âm đơn lẻ rõ ràng, chính xác. Nhấn trọng âm từ và trọng âm câu tương đối chính xác. Có nỗ lực trong việc thể hiện ngữ điệu câu.",
                "8": "Phát âm rõ ràng, tự nhiên, và dễ hiểu. Phát âm đơn lẻ rõ ràng, chính xác. Nhấn trọng âm từ và trọng âm câu tương đối chính xác. Rất nỗ lực trong việc thể hiện ngữ điệu câu.",
                "9": "Phát âm, đặt trọng âm từ và câu chính xác. Có ngữ điệu câu phù hợp. Có thể thay đổi trọng âm câu để thể hiện các sắc thái ý nghĩa khác nhau.",
                "10": "Phát âm, đặt trọng âm từ và câu chính xác. Có ngữ điệu câu phù hợp. Có thể thay đổi trọng âm câu và ngữ điệu để thể hiện các sắc thái ý nghĩa khác nhau và các chức năng khác nhau của ngôn ngữ."
            }
        },
        "fluency": {
            "name": "Độ lưu loát (Fluency)",
            "sub_criteria": "Ngập ngừng & Nói dài",
            "weight": 0.20,
            "description": "Tốc độ nói, độ liền mạch, ngập ngừng tìm từ/ý, duy trì lượt lời và độ dài câu trả lời.",
            "band_descriptors": {
                "0": "Thí sinh không dự thi.",
                "1": "Chỉ có thể nói một cách rời rạc, ngập ngừng những từ và cụm từ rất ngắn, phần lớn là những câu đã học thuộc.",
                "2": "Có thể nói những cụm từ và câu ngắn một cách rất chậm chạp, thường xuyên bị lỡ lời và phải nhắc lại.",
                "3": "Có thể diễn đạt một cách khá trôi chảy những ý đơn giản, và hầu như không diễn đạt được ý phức tạp.",
                "4": "Có thể diễn đạt trôi chảy những ý đơn giản, và có cố gắng diễn đạt một số ý phức tạp nhưng còn chậm do phải tìm cấu trúc và từ vựng. Biết sử dụng các cụm từ và câu đơn giản để kéo dài câu trả lời.",
                "5": "Có thể diễn đạt trôi chảy những ý đơn giản và diễn đạt được những ý phức tạp nhưng còn chậm do phải tìm cấu trúc và từ vựng. Có thể nói các đoạn dài nhưng còn mắc lỗi sai và có dấu hiệu của sửa lỗi.",
                "6": "Có thể giao tiếp dễ dàng và tương đối lưu loát những ý đơn giản và phức tạp, có thể ngập ngừng nhưng không phải quá lâu để tìm cấu trúc và từ vựng. Có thể nói các đoạn dài nhưng còn mắc một số lỗi không hệ thống và có dấu hiệu của sửa lỗi.",
                "7": "Có thể giao tiếp dễ dàng và tương đối lưu loát, đều đặn những ý đơn giản và phức tạp, đôi lúc còn ngập ngừng nhưng không phải quá lâu để tìm cấu trúc và từ vựng. Có thể nói các đoạn dài nhưng đôi khi còn lặp từ và còn cần sửa lỗi.",
                "8": "Có thể giao tiếp dễ dàng, khá lưu loát, đều đặn những ý đơn giản và phức tạp, đôi lúc còn ngập ngừng, nhưng không phải mất thời gian để tìm cấu trúc và từ vựng. Có thể nói các đoạn dài tuy còn mắc một số lỗi nhỏ.",
                "9": "Thường xuyên nói các đoạn dài và có thể diễn đạt ý một cách dễ dàng, lưu loát, tự nhiên, nhưng đôi khi còn hiện tượng lặp từ hay sửa lỗi. Hầu như không có dấu hiệu về việc ngập ngừng để tìm từ và cấu trúc, chỉ ngập ngừng khi tìm ý để diễn đạt về một số chủ đề khó về mặt khái niệm.",
                "10": "Thường xuyên nói các đoạn dài và có thể diễn đạt ý một cách dễ dàng, lưu loát, tự nhiên, và hiếm khi có hiện tượng lặp từ hay sửa lỗi. Không có dấu hiệu về việc ngập ngừng để tìm từ và cấu trúc, chỉ ngập ngừng khi tìm ý để diễn đạt về một số chủ đề khó về mặt khái niệm."
            }
        },
        "topic_development": {
            "name": "Bố cục nội dung (Topic Development)",
            "sub_criteria": "Phát triển chủ đề & Tính mạch lạc liên kết",
            "weight": 0.20,
            "description": "Mức độ phù hợp với câu hỏi, phát triển ý bằng chi tiết/ví dụ, cấu trúc chặt chẽ và sử dụng phương tiện liên kết.",
            "band_descriptors": {
                "0": "Thí sinh không dự thi.",
                "1": "Hầu như không diễn đạt hoặc phát triển được ý. Chỉ có thể liên kết từ và cụm từ bằng các từ kết nối như 'và' hoặc 'thì'.",
                "2": "Trả lời được câu hỏi nhưng nội dung trả lời chưa phù hợp và không phát triển được ý ngoài những từ khóa được gợi ý. Có thể sử dụng một số phương tiện kết nối đơn giản như 'và', 'nhưng', 'bởi vì'.",
                "3": "Trả lời tương đối phù hợp được các câu hỏi và có thể phát triển ý nhưng mới chỉ dưới dạng liệt kê. Có thể liên kết ý bằng một số các phương tiện kết nối đơn giản nhưng hay bị lặp.",
                "4": "Trả lời phù hợp được các câu hỏi và thể hiện cố gắng phát triển ý nhưng chỉ dưới dạng liệt kê. Có thể liên kết ý bằng một số các phương tiện kết nối đơn giản nhưng đôi khi bị lặp.",
                "5": "Trả lời phù hợp được các câu hỏi và có thể phát triển ý dưới dạng liệt kê, tuy có dấu hiệu cố gắng mở rộng ý nhưng các ý mở rộng thường chưa rõ ràng hoặc bị lặp. Có thể liên kết ý một cách khá đa dạng khi sử dụng các phương tiện kết nối đơn giản.",
                "6": "Có thể phát triển ý một cách tương đối dễ dàng, mở rộng ý bằng một số chi tiết và ví dụ minh họa phù hợp. Có thể sử dụng các phương tiện kết nối phức tạp hơn nhưng chưa thể hiện được rõ ràng mối quan hệ giữa các ý.",
                "7": "Có thể phát triển ý một cách khá dễ dàng, mở rộng ý bằng những chi tiết và ví dụ minh họa phù hợp. Có thể sử dụng nhiều loại phương tiện kết nối để thể hiện khá rõ ràng mối quan hệ giữa các ý.",
                "8": "Có thể phát triển ý một cách dễ dàng, mở rộng ý bằng những chi tiết và ví dụ minh họa phù hợp. Có thể sử dụng nhiều loại phương tiện kết nối để thể hiện rõ ràng mối quan hệ giữa các ý.",
                "9": "Có thể dễ dàng phát triển ý một cách khá tường tận với các chi tiết và ví dụ minh họa phù hợp, và đưa ra kết luận phù hợp. Có thể trình bày ý rõ ràng, mạch lạc với cấu trúc chặt chẽ, thể hiện khả năng sử dụng khá thành thạo các phương tiện kết nối và các hình thức tổ chức ý.",
                "10": "Có thể dễ dàng phát triển ý một cách tường tận với các chi tiết và ví dụ minh họa phù hợp, và đưa ra kết luận phù hợp. Có thể trình bày ý rõ ràng, mạch lạc với cấu trúc chặt chẽ, thể hiện khả năng sử dụng thành thạo các phương tiện kết nối và các hình thức tổ chức ý."
            }
        }
    }
}

# Preset 5 tiêu chí chuẩn tiếng Anh (VSTEP CEFR English Edition)
DEFAULT_RUBRIC_EN: dict[str, Any] = {
    "version": "2.0",
    "name": "Official VSTEP Speaking Rubric – Levels 3-5 (5 Criteria)",
    "description": "Official 5-criteria assessment rubric aligned with CEFR B1-B2-C1 proficiency levels (Grammar, Vocabulary, Pronunciation, Fluency, Topic Development) on a 0-10 scale.",
    "settings": {
        "examiner_strictness": "standard",
        "feedback_language": "en",
        "max_feedback_items": 4,
        "wpm_range": {"min": 110, "max": 150}
    },
    "criteria": {
        "grammar": {
            "name": "Grammar & Accuracy",
            "sub_criteria": "Grammatical Range & Accuracy",
            "weight": 0.20,
            "description": "Syntactic complexity, simple/complex sentence handling, grammatical accuracy, error control, and self-correction.",
            "band_descriptors": {
                "0": "Candidate absent / No performance.",
                "1": "Can only use a very limited range of memorized simple grammatical structures and basic phrase patterns.",
                "2": "Uses simple structures with reasonable accuracy but shows systematic basic errors; communicative intent is partially conveyed.",
                "3": "Uses familiar simple sentence forms with reasonable accuracy; though errors are frequent, basic meaning is conveyed clearly.",
                "4": "Accurately produces common simple sentence forms in routine contexts; occasional errors do not obscure meaning.",
                "5": "Produces common simple sentences accurately in routine contexts with minor errors. Attempts complex sentence forms with noticeable errors.",
                "6": "Flexibly and accurately uses simple sentences and some complex structures; minor slips do not lead to misunderstanding.",
                "7": "Flexibly and accurately handles simple and fairly diverse complex sentences; occasional non-systematic errors occur.",
                "8": "Consistently uses simple and a wide variety of complex sentences accurately; can self-correct slips immediately.",
                "9": "Uses a rich variety of complex sentence structures flexibly and accurately; errors are rare and hard to detect.",
                "10": "Displays full, flexible, and virtually error-free control over a wide variety of advanced sentence structures."
            }
        },
        "vocabulary": {
            "name": "Vocabulary & Resource",
            "sub_criteria": "Lexical Range & Precision",
            "weight": 0.20,
            "description": "Lexical range, contextual precision, avoidance of repetition, idiomatic expressions, and paraphrasing.",
            "band_descriptors": {
                "0": "Candidate absent / No performance.",
                "1": "Only produces isolated words and basic phrases related to very familiar personal topics.",
                "2": "Uses simple words and phrases for very familiar topics. Selects correct word forms within this basic scope.",
                "3": "Possesses sufficient vocabulary for familiar topics, although word repetition is frequent.",
                "4": "Uses vocabulary for familiar topics with occasional repetition. Attempts less familiar topics but makes frequent lexical choice errors.",
                "5": "Uses vocabulary for familiar topics with occasional repetition. Attempts unfamiliar topics with only minor lexical errors.",
                "6": "Sufficient vocabulary for most familiar topics; actively avoids repetition when attempting unfamiliar topics. Fairly high lexical accuracy.",
                "7": "Wide range of vocabulary on familiar topics; makes conscious efforts to avoid repetition on unfamiliar subjects. High precision with occasional hesitation.",
                "8": "Broad lexical repertoire across both familiar and unfamiliar topics. Uses less common expressions and idiomatic phrases with good control.",
                "9": "Extensive vocabulary including uncommon words, idiomatic expressions, and colloquialisms. Skillfully paraphrases with rare slips.",
                "10": "Extensive and sophisticated lexical resource including idiomatic expressions and nuance. Paraphrases effortlessly without errors."
            }
        },
        "pronunciation": {
            "name": "Pronunciation & Intonation",
            "sub_criteria": "Individual Sounds, Stress & Intonation",
            "weight": 0.20,
            "description": "Clarity of individual sounds, word stress, sentence stress, rhythm, and expressive intonation.",
            "band_descriptors": {
                "0": "Candidate absent / No performance.",
                "1": "Produces very simple words with low phonological accuracy, causing frequent listener strain.",
                "2": "Relatively intelligible on simple words, but listener frequently needs repetition due to unclear delivery.",
                "3": "Intelligible delivery on familiar words, but exhibits noticeable errors in individual sounds and word stress.",
                "4": "Intelligible delivery on words and phrases with occasional individual sound errors. Attempts word stress though errors are frequent.",
                "5": "Intelligible and clear delivery; minor sound errors. Attempts word stress with emerging accuracy.",
                "6": "Clear, natural, and easily intelligible pronunciation. Individual sounds are mostly accurate. Word stress is mostly correct; attempts intonation.",
                "7": "Clear, natural, and easily intelligible pronunciation. Individual sounds are clear and accurate. Word stress and sentence stress are accurate.",
                "8": "Clear, natural, and expressive pronunciation. Accurate individual sounds and clear sentence stress with effective intonation.",
                "9": "Accurate pronunciation, word stress, and sentence stress throughout. Natural intonation that conveys subtle shades of meaning.",
                "10": "Flawless phonological control, natural rhythm, and flexible intonation used effectively for communicative and stylistic nuance."
            }
        },
        "fluency": {
            "name": "Fluency & Coherence",
            "sub_criteria": "Hesitation & Speech Continuity",
            "weight": 0.20,
            "description": "Speaking rate, speech continuity, natural tempo, minimal hesitation, and extended discourse management.",
            "band_descriptors": {
                "0": "Candidate absent / No performance.",
                "1": "Speaks with fragmented, halting delivery of very short memorized phrases.",
                "2": "Speaks very slowly in short phrases; frequently stumbles and repeats words.",
                "3": "Can express simple ideas fairly smoothly; almost unable to handle complex thoughts.",
                "4": "Smooth delivery on simple ideas; attempts complex thoughts slowly due to searching for words/grammar.",
                "5": "Smooth on simple ideas; manages complex ideas with noticeable search pauses. Extended turns with self-correction.",
                "6": "Communicates smoothly on both simple and complex ideas; search pauses are not prolonged. Maintains longer turns.",
                "7": "Communicates easily and steadily on simple and complex ideas; minimal search hesitation with minor self-correction.",
                "8": "Speaks fluently and effortlessly on most topics; pauses are content-related rather than language-searching.",
                "9": "Consistently maintains long, natural, and fluent stretches of speech; virtually no language hesitation.",
                "10": "Speaks completely fluently and naturally at a native-like tempo; no language-related pauses or hesitation."
            }
        },
        "topic_development": {
            "name": "Topic Development",
            "sub_criteria": "Idea Development & Cohesive Devices",
            "weight": 0.20,
            "description": "Prompt relevance, elaboration with details/examples, logical organization, and effective cohesive transitions.",
            "band_descriptors": {
                "0": "Candidate absent / No performance.",
                "1": "Barely expresses or develops ideas. Only links words with basic connectors like 'and' or 'then'.",
                "2": "Addresses prompts but fails to develop beyond given keywords. Uses basic connectors such as 'and', 'but', 'because'.",
                "3": "Answers prompts appropriately with simple listing of points. Connects ideas using simple, repetitive cohesive devices.",
                "4": "Answers prompts appropriately with attempts to expand beyond mere listing. Uses simple connectors with occasional repetition.",
                "5": "Develops points beyond simple listing; elaboration can be unclear or slightly repetitive. Uses simple cohesive devices.",
                "6": "Develops topics relatively easily, supporting ideas with relevant details and examples. Uses complex connectors.",
                "7": "Develops topics clearly and easily with appropriate supporting examples. Employs a variety of cohesive devices.",
                "8": "Fully develops topics with rich, relevant details and examples. Uses a wide range of cohesive devices logically.",
                "9": "Thoroughly and persuasively elaborates ideas with examples and suitable conclusions. Clear, well-structured organization.",
                "10": "Sophisticated topic development with in-depth analysis, compelling examples, and logical conclusions. Seamless transitions."
            }
        }
    }
}

# Mặc định của toàn bộ hệ thống là Barem 5 Tiêu Chí Chuẩn Bộ GD&ĐT
DEFAULT_RUBRIC: dict[str, Any] = OFFICIAL_VSTEP_RUBRIC_VI


def get_active_rubric() -> dict[str, Any]:
    """
    Nạp cấu hình rubric đang hoạt động từ file rubric_config.json.
    Nếu file chưa tồn tại hoặc bị lỗi, tự động tạo mới từ bộ mẫu OFFICIAL_VSTEP_RUBRIC_VI.
    """
    if os.path.exists(RUBRIC_CONFIG_PATH):
        try:
            with open(RUBRIC_CONFIG_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, dict) and "criteria" in data:
                    return data
        except Exception as e:
            print(f"[RUBRIC] Lỗi khi đọc rubric_config.json ({e}), sử dụng rubric mặc định.")

    save_rubric(DEFAULT_RUBRIC)
    return DEFAULT_RUBRIC


def validate_rubric(data: dict[str, Any]) -> tuple[bool, str]:
    """
    Kiểm tra tính hợp lệ của dữ liệu Rubric trước khi lưu.
    Hỗ trợ linh hoạt cả bộ 4 tiêu chí quốc tế và bộ 5 tiêu chí của Bộ GD&ĐT.
    """
    if not isinstance(data, dict):
        return False, "Dữ liệu rubric phải là một đối tượng JSON hợp lệ."

    criteria = data.get("criteria")
    if not isinstance(criteria, dict) or len(criteria) == 0:
        return False, "Thiếu trường 'criteria' hoặc danh sách tiêu chí rỗng."

    total_weight = 0.0

    for key, item in criteria.items():
        if not isinstance(item, dict):
            return False, f"Cấu hình tiêu chí '{key}' phải là một đối tượng."
        try:
            w = float(item.get("weight", 0))
            if 1.0 < w <= 100.0:
                w = w / 100.0
                item["weight"] = w
            if w < 0 or w > 1.0:
                return False, f"Trọng số của '{key}' phải nằm trong khoảng từ 0.0 đến 1.0 (tương đương 0% đến 100%)."
            total_weight += w
        except (ValueError, TypeError):
            return False, f"Trọng số của '{key}' không hợp lệ."

    if abs(total_weight - 1.0) > 0.02:
        return False, f"Tổng trọng số của các tiêu chí phải bằng 100% (Hiện tại: {round(total_weight * 100, 1)}%)."

    # Tự động cân bằng chuẩn hóa nếu có sai số float nhỏ để tổng đạt đúng 1.0
    if abs(total_weight - 1.0) > 1e-6 and total_weight > 0:
        for key in criteria.keys():
            criteria[key]["weight"] = round(float(criteria[key]["weight"]) / total_weight, 4)

    # Kiểm tra settings
    settings = data.get("settings", {})
    if isinstance(settings, dict):
        wpm = settings.get("wpm_range", {})
        if isinstance(wpm, dict):
            try:
                w_min = int(float(wpm.get("min", 110)))
                w_max = int(float(wpm.get("max", 150)))
                wpm["min"] = w_min
                wpm["max"] = w_max
                if w_min <= 0 or w_max <= w_min:
                    return False, "Dải tốc độ WPM không hợp lệ (Min phải > 0 và Max phải > Min)."
            except (ValueError, TypeError):
                return False, "Ngưỡng WPM phải là số nguyên hợp lệ."

    return True, ""


def save_rubric(data: dict[str, Any]) -> dict[str, Any]:
    """
    Lưu cấu hình rubric vào file rubric_config.json an toàn qua file tạm.
    """
    is_valid, err_msg = validate_rubric(data)
    if not is_valid:
        raise ValueError(err_msg)

    temp_fd, temp_path = tempfile.mkstemp(dir=BASE_DIR, prefix="rubric_tmp_", suffix=".json")
    try:
        with os.fdopen(temp_fd, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        if os.path.exists(RUBRIC_CONFIG_PATH):
            os.remove(RUBRIC_CONFIG_PATH)
        os.rename(temp_path, RUBRIC_CONFIG_PATH)
    except Exception as e:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass
        raise e

    return data


def get_rubric_presets() -> dict[str, Any]:
    """Trả về danh sách các preset Rubric có sẵn (5 tiêu chí Bộ GD&ĐT và 4 tiêu chí CEFR)."""
    return {
        "official_vstep_vi": OFFICIAL_VSTEP_RUBRIC_VI,
        "cefr_4crit_en": DEFAULT_RUBRIC_EN
    }


def reset_rubric(lang: str = "vi") -> dict[str, Any]:
    """Khôi phục cấu hình rubric về mặc định (Mặc định: Chuẩn 5 tiêu chí Bộ GD&ĐT)."""
    if str(lang).lower() in ("en", "english"):
        return save_rubric(DEFAULT_RUBRIC_EN)
    return save_rubric(OFFICIAL_VSTEP_RUBRIC_VI)


def calculate_weighted_overall(criteria_scores: dict[str, float], rubric: dict[str, Any] | None = None) -> float:
    """
    Tính điểm tổng (overall_score) theo đúng trọng số của các tiêu chí trong Rubric đang hoạt động,
    sau đó làm tròn theo chuẩn bước nhảy 0.5 của VSTEP.
    """
    if not rubric:
        rubric = get_active_rubric()

    criteria = rubric.get("criteria", {})
    total_score = 0.0
    total_weight = 0.0

    for key, ccfg in criteria.items():
        score = float(criteria_scores.get(key, 0.0))
        weight = float(ccfg.get("weight", 1.0 / max(len(criteria), 1)))
        total_score += score * weight
        total_weight += weight

    if total_weight > 0:
        calculated = total_score / total_weight
    else:
        calculated = sum(criteria_scores.values()) / max(len(criteria_scores), 1)

    rounded = round(calculated * 2) / 2
    return max(0.0, min(10.0, rounded))


def build_rubric_prompt_instructions(rubric: dict[str, Any] | None = None) -> str:
    """
    Tạo đoạn chỉ dẫn chi tiết về Rubric được chèn trực tiếp vào Prompt của AI Examiner.
    Hỗ trợ đầy đủ cả 5 tiêu chí chuẩn Bộ GD&ĐT.
    """
    if not rubric:
        rubric = get_active_rubric()

    settings = rubric.get("settings", {})
    strictness = settings.get("examiner_strictness", "standard")
    wpm_range = settings.get("wpm_range", {"min": 110, "max": 150})
    feedback_lang = settings.get("feedback_language", "vi")
    max_items = settings.get("max_feedback_items", 4)

    strictness_guide = {
        "strict": "Apply strict evaluation standards. Penalize grammatical inaccuracies, simplistic vocabulary, and weak coherence decisively.",
        "standard": "Apply official VSTEP standard evaluation according to Ministry of Education guidelines.",
        "lenient": "Apply encouraging evaluation standards. Focus on communicative intent while providing actionable advice."
    }.get(strictness, "Apply official VSTEP standard evaluation.")

    lang_desc = "Vietnamese (tiếng Việt)" if feedback_lang == "vi" else "English"

    criteria = rubric.get("criteria", {})
    lines = [
        f"OFFICIAL VSTEP SPEAKING RUBRIC ({rubric.get('name', 'Bộ GD&ĐT Bậc 3-5')}):",
        f"- Strictness: {strictness.upper()} ({strictness_guide})",
        f"- Speech Rate Target: {wpm_range.get('min', 110)} - {wpm_range.get('max', 150)} WPM.",
        f"- Feedback Language: {lang_desc}. Provide exactly 3 to {max_items} high-impact feedback items.",
        "- Core Criteria & Official Descriptors:"
    ]

    for key, cdata in criteria.items():
        weight_pct = int(float(cdata.get("weight", 0.20)) * 100)
        cname = cdata.get("name", key.capitalize())
        sub_c = cdata.get("sub_criteria", "")
        cdesc = cdata.get("description", "")
        bands = cdata.get("band_descriptors", {})

        lines.append(f"  * {cname} [{sub_c}] (Weight: {weight_pct}%): {cdesc}")
        
        # Nếu có bảng mốc 0-10, tóm tắt các mốc phân bậc C1 (9-10), B2 (7-8), B1 (4-6), A2 (2-3)
        if "10" in bands or "9" in bands:
            b10 = bands.get("10", bands.get("9", ""))
            b8 = bands.get("8", bands.get("7", ""))
            b6 = bands.get("6", bands.get("5", ""))
            b4 = bands.get("4", bands.get("3", ""))
            b2 = bands.get("2", bands.get("1", ""))
            lines.append(f"    - Score 9.0 - 10.0 (C1 / Bậc 5): {b10}")
            lines.append(f"    - Score 7.0 - 8.5 (B2 / Bậc 4): {b8}")
            lines.append(f"    - Score 5.0 - 6.5 (B1+ / Bậc 3+): {b6}")
            lines.append(f"    - Score 3.5 - 4.5 (B1 / Bậc 3): {b4}")
            lines.append(f"    - Score 1.0 - 3.0 (A2 / Bậc 2): {b2}")
        else:
            b_c1 = bands.get("c1", "Advanced proficiency")
            b_b2 = bands.get("b2", "Independent operational proficiency")
            b_b1 = bands.get("b1", "Threshold conversational proficiency")
            lines.append(f"    - Band 8.5 - 10.0 (C1 Level): {b_c1}")
            lines.append(f"    - Band 6.0 - 8.0 (B2 Level): {b_b2}")
            lines.append(f"    - Band 4.0 - 5.5 (B1 Level): {b_b1}")

    return "\n".join(lines)
