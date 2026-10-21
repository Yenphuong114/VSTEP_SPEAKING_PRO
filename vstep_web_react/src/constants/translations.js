export const I18N_TRANSLATIONS = {
  vi: {
    app_title: "VSTEP Speaking Pro",
    theme_toggle_title: "Chuyển chế độ sáng/tối",
    sidebar_toggle_title: "Mở thanh chức năng",
    lang_vi: "Tiếng Việt",
    lang_en: "English (UK/US)",
    sidebar_user_label: "Giảng viên",
    sidebar_section_tools: "Công Cụ Đánh Giá",
    sidebar_section_config: "Cấu hình",
    nav_grade: "Chấm điểm đơn",
    nav_batch: "Chấm hàng loạt",
    nav_compare: "So sánh AI vs GV",
    badge_new: "Mới",
    nav_history: "Lịch sử",
    nav_rubric: "Cấu hình Rubric",
    logout_btn: "Đăng xuất",

    // Grade Page
    page_grade_subtitle: "Chấm điểm nói VSTEP bằng AI — 5 tiêu chí chuẩn Bộ GD&ĐT (Bậc 3-5)",
    tab_feedback: "Kết quả Đánh giá",
    tab_history: "Lịch sử",
    overall_score_label: "Điểm tổng quan:",
    criterion_grammar: "Ngữ pháp",
    criterion_vocab: "Từ vựng",
    criterion_pronun: "Phát âm",
    criterion_fluency: "Trôi chảy",
    criterion_topic_dev: "Bố cục nội dung",
    feedback_header: "Nhận xét & Khắc phục:",
    feedback_empty: "Hoàn thành bài thi để xem AI phân tích chi tiết lỗi sai của bạn tại đây.",
    model_answer_header: "Bài nói mẫu (Band 9-10):",
    model_answer_empty: "Bài nói mẫu sẽ hiển thị sau khi bạn nộp bài...",
    btn_retry: "Luyện tập đề khác",
    history_empty: "Chưa có dữ liệu lịch sử luyện tập.",
    practice_area_title: "Khu vực làm bài",
    exam_part_label: "Chọn Phần Thi (Tự động đổi thời gian)",
    exam_part_1: "Part 1: Social Interaction (3 Phút)",
    exam_part_2: "Part 2: Solution Discussion (3 Phút)",
    exam_part_3: "Part 3: Topic Development (4 Phút)",
    topic_hint: "Enter để máy nhận đề",
    live_listening: "AI đang nghe...",
    live_waiting: "Đang đợi giọng nói...",
    btn_record_start: "Bắt đầu thu âm",
    btn_record_stop: "Dừng thu âm & Chấm bài",
    btn_evaluating: "AI đang chấm điểm...",
    btn_upload_audio: "Tải file âm thanh (.mp3, .wav, .m4a)",
    btn_upload_txt: "Tải đề (.txt)",

    // Batch Page
    batch_modal_title: "Chấm điểm hàng loạt",
    batch_modal_alert: "Tải lên cùng lúc nhiều file âm thanh. Hệ thống tự động chấm điểm và lưu kết quả vào Lịch sử.",
    batch_step1_title: "1. Cấu hình Đề bài (Áp dụng chung)",
    batch_part_label: "Chọn Phần Thi",
    batch_topic_label: "Nội dung đề bài",
    batch_step2_title: "2. Tải lên File Âm Thanh",
    batch_btn_select: "Chọn nhiều file âm thanh",
    batch_no_files: "Chưa chọn file nào.",
    batch_files_selected: "file được chọn",
    batch_progress_title: "Tiến trình chấm điểm:",
    batch_file_details: "Chi tiết các file",
    batch_btn_start: "Bắt đầu chấm hàng loạt",
    batch_status_pending: "Đang chờ",
    batch_status_processing: "Đang chấm...",
    batch_status_done: "Đã xong",
    batch_status_error: "Lỗi",

    // Compare Page
    compare_title: "So sánh AI vs Giáo Viên",
    compare_subtitle: "Nhập điểm giáo viên để đối chiếu với kết quả AI chấm và phân tích mức độ đồng thuận.",
    kpi_total_files: "File đã chấm",
    kpi_agreement: "Đồng thuận AI-GV",
    kpi_mae: "Sai số trung bình (MAE)",
    agreement_label: "Tỷ lệ đồng thuận tổng thể",
    btn_auto_detect: "Auto-detect điểm GV từ tên file",
    btn_save_gv: "Lưu điểm GV",
    btn_show_dashboard: "Cập nhật biểu đồ",
    col_filename: "Tên file",
    col_ai_total: "AI Tổng",
    col_gv_score: "Điểm GV",
    col_match: "Khớp %",
    compare_empty: "Chưa có dữ liệu. Hãy chấm bài trước ở trang 'Chấm điểm'.",
    compare_gv_note: "* Cột GV* = điểm từng tiêu chí ước tính đồng đều từ điểm tổng GV.",
    chart_title: "Biểu đồ Phân bổ Điểm: AI vs Giáo Viên",

    // History Page
    page_history_subtitle: "Tất cả bài nói đã chấm điểm bằng AI.",
    history_delete_confirm: "Bạn có chắc chắn muốn xóa bài nói này khỏi lịch sử?",
    history_topic_label: "Đề bài:",
    history_speech_label: "Bạn nói:",
    history_silence: "(Không thu được giọng nói / Im lặng)",

    // Rubric Modal
    rubric_modal_title: "Cấu hình Rubric Chấm điểm VSTEP",
    rubric_modal_subtitle: "Tra cứu Barem chính thức 0-10 từ Bộ GD&ĐT, tùy chỉnh trọng số 5 tiêu chí và phong cách giám khảo AI",
    rubric_preset_label: "Mẫu chuẩn ngôn ngữ:",
    rubric_preset_en_btn: "🇬🇧 Tiếng Anh (CEFR)",
    rubric_preset_vi_btn: "🇻🇳 Chuẩn Bộ GD&ĐT (5 Tiêu chí)",
    rubric_tab_matrix: "1. Bảng Barem Chuẩn 0-10",
    rubric_tab_weights: "2. Trọng số & Tỷ trọng",
    rubric_tab_descriptors: "3. Mô tả Band (B1 - B2 - C1)",
    rubric_tab_settings: "4. Giám khảo AI & WPM",
    rubric_total_weight_label: "Tổng trọng số tính điểm:",
    rubric_balance_btn: "Chia đều (20%)",
    rubric_total_valid: "100% (Hợp lệ)",
    rubric_total_invalid_prefix: "Tổng hiện tại: ",
    rubric_alert_ready: "Tổng trọng số chuẩn 100%. Sẵn sàng lưu!",
    rubric_alert_error: "Tổng 5 tiêu chí phải đúng 100% để lưu.",
    rubric_crit_desc_label: "Mô tả tiêu chí:",
    rubric_desc_info: "Mô tả tiêu chuẩn kỳ vọng của từng mức điểm VSTEP được nạp trực tiếp vào Prompt AI.",
    rubric_title_grammar: "Ngữ pháp (Grammar)",
    rubric_title_vocabulary: "Từ vựng (Vocabulary)",
    rubric_title_pronunciation: "Phát âm (Pronunciation)",
    rubric_title_fluency: "Trôi chảy (Fluency)",
    rubric_title_topic_dev: "Bố cục nội dung (Topic Development)",
    rubric_strictness_label: "Mức độ khắt khe (Examiner Strictness)",
    rubric_strictness_standard: "Chuẩn VSTEP (Standard)",
    rubric_strictness_strict: "Khắt khe (Strict - Siết chặt lỗi cho mục tiêu C1)",
    rubric_strictness_lenient: "Khuyến khích (Lenient - Nhẹ tay cho B1)",
    rubric_lang_label: "Ngôn ngữ nhận xét (Detailed Feedback)",
    rubric_lang_vi: "Tiếng Việt (Rõ ràng, dễ tiếp thu)",
    rubric_lang_en: "English (Chuẩn quốc tế)",
    rubric_max_errors_label: "Số lỗi tối đa cần chỉ ra",
    rubric_min_wpm_label: "Tốc độ tối thiểu (Min WPM)",
    rubric_max_wpm_label: "Tốc độ tối đa (Max WPM)",
    rubric_btn_close: "Đóng",
    rubric_btn_save: "Lưu cấu hình",
    rubric_btn_reset: "Khôi phục mặc định",

    // Auth
    login_title: "VSTEP Speaking Pro",
    login_subtitle: "AI Assessment Suite v3.0 (React Edition)",
    login_password_label: "Mật khẩu giảng viên",
    login_password_placeholder: "Nhập mật khẩu...",
    login_btn: "Đăng nhập",
    login_error_wrong: "Mật khẩu không đúng. Vui lòng thử lại.",
    login_error_network: "Không kết nối được Backend (:8000). Hãy kiểm tra server."
  },

  en: {
    app_title: "VSTEP Speaking Pro",
    theme_toggle_title: "Switch Light/Dark Mode",
    sidebar_toggle_title: "Toggle Menu",
    lang_vi: "Tiếng Việt",
    lang_en: "English (UK/US)",
    sidebar_user_label: "Teacher",
    sidebar_section_tools: "AI Tools",
    sidebar_section_config: "Configuration",
    nav_grade: "Single Grade",
    nav_batch: "Batch Grade",
    nav_compare: "AI vs Teacher",
    badge_new: "New",
    nav_history: "History",
    nav_rubric: "Rubric Config",
    logout_btn: "Logout",

    // Grade Page
    page_grade_subtitle: "AI-Powered VSTEP Speaking Assessment — 5 Criteria (Ministry of Education Standard)",
    tab_feedback: "Assessment Feedback",
    tab_history: "History",
    overall_score_label: "Overall Score:",
    criterion_grammar: "Grammar",
    criterion_vocab: "Vocabulary",
    criterion_pronun: "Pronunciation",
    criterion_fluency: "Fluency",
    criterion_topic_dev: "Topic Development",
    feedback_header: "Detailed AI Feedback & Suggestions:",
    feedback_empty: "Complete your test to see detailed AI diagnostic feedback here.",
    model_answer_header: "Model Answer (Band 9-10):",
    model_answer_empty: "Model answer will appear after you submit your speech...",
    btn_retry: "Practice Another Topic",
    history_empty: "No practice history recorded yet.",
    practice_area_title: "Practice Console",
    exam_part_label: "Select Exam Part",
    exam_part_1: "Part 1: Social Interaction (3 Minutes)",
    exam_part_2: "Part 2: Solution Discussion (3 Minutes)",
    exam_part_3: "Part 3: Topic Development (4 Minutes)",
    topic_hint: "Press Enter to register topic",
    live_listening: "AI Listening...",
    live_waiting: "Waiting for voice input...",
    btn_record_start: "Start Recording",
    btn_record_stop: "Finish & Submit",
    btn_evaluating: "AI is evaluating...",
    btn_upload_audio: "Upload Audio File (.mp3, .wav, .m4a)",
    btn_upload_txt: "Upload topic (.txt)",

    // Batch Page
    batch_modal_title: "Batch Assessment",
    batch_modal_alert: "Upload multiple audio files at once. The system automatically grades each file and records results.",
    batch_step1_title: "1. Topic Configuration",
    batch_part_label: "Select Exam Part",
    batch_topic_label: "Topic Content",
    batch_step2_title: "2. Upload Audio Files",
    batch_btn_select: "Choose Audio Files",
    batch_no_files: "No files selected.",
    batch_files_selected: "files selected",
    batch_progress_title: "Grading Progress:",
    batch_file_details: "File Details",
    batch_btn_start: "Start Batch Evaluation",
    batch_status_pending: "Pending",
    batch_status_processing: "Processing...",
    batch_status_done: "Done",
    batch_status_error: "Error",

    // Compare Page
    compare_title: "AI vs Teacher Comparison",
    compare_subtitle: "Enter teacher scores to contrast with AI results and analyze agreement levels.",
    kpi_total_files: "Graded Files",
    kpi_agreement: "AI-Teacher Agreement",
    kpi_mae: "Mean Absolute Error (MAE)",
    agreement_label: "Overall Agreement Rate",
    btn_auto_detect: "Auto-detect Teacher Scores",
    btn_save_gv: "Save Teacher Scores",
    btn_show_dashboard: "Update Chart",
    col_filename: "Filename",
    col_ai_total: "AI Total",
    col_gv_score: "Teacher Score",
    col_match: "Match %",
    compare_empty: "No data. Please grade some audio files first.",
    compare_gv_note: "* Teacher* = estimated criteria score distributed evenly from overall score.",
    chart_title: "Score Distribution: AI vs Teacher",

    // History Page
    page_history_subtitle: "All speaking attempts assessed by AI.",
    history_delete_confirm: "Are you sure you want to delete this record?",
    history_topic_label: "Topic:",
    history_speech_label: "You said:",
    history_silence: "(No speech detected / Silence)",

    // Rubric Modal
    rubric_modal_title: "VSTEP Speaking Rubric Configuration",
    rubric_modal_subtitle: "Customize weights, CEFR B1-B2-C1 descriptors, and AI examiner style",
    rubric_preset_label: "Rubric Preset:",
    rubric_preset_en_btn: "🇬🇧 English (CEFR)",
    rubric_preset_vi_btn: "🇻🇳 Vietnamese (MOET Official)",
    rubric_tab_matrix: "1. Official 0-10 Matrix",
    rubric_tab_weights: "2. Criteria & Weights",
    rubric_tab_descriptors: "3. Band Descriptors (B1-B2-C1)",
    rubric_tab_settings: "4. AI Examiner & WPM",
    rubric_total_weight_label: "Total Weight:",
    rubric_balance_btn: "Balance (20% each)",
    rubric_total_valid: "100% (Valid)",
    rubric_total_invalid_prefix: "Current total: ",
    rubric_alert_ready: "Total weight is exactly 100%. Ready to save!",
    rubric_alert_error: "Total 5 criteria weights must equal 100% to save.",
    rubric_crit_desc_label: "Criterion Description:",
    rubric_desc_info: "Standard expectation descriptions for VSTEP levels fed directly into the AI prompt.",
    rubric_title_grammar: "Grammar & Accuracy",
    rubric_title_vocabulary: "Vocabulary & Resource",
    rubric_title_pronunciation: "Pronunciation & Intonation",
    rubric_title_fluency: "Fluency & Coherence",
    rubric_title_topic_dev: "Topic Development & Structure",
    rubric_strictness_label: "Examiner Strictness",
    rubric_strictness_standard: "Standard VSTEP",
    rubric_strictness_strict: "Strict (Target C1)",
    rubric_strictness_lenient: "Lenient (Beginner B1)",
    rubric_lang_label: "Detailed Feedback Language",
    rubric_lang_vi: "Tiếng Việt (Vietnamese)",
    rubric_lang_en: "English (International)",
    rubric_max_errors_label: "Max Errors to Point Out",
    rubric_min_wpm_label: "Minimum WPM",
    rubric_max_wpm_label: "Maximum WPM",
    rubric_btn_close: "Close",
    rubric_btn_save: "Save Rubric",
    rubric_btn_reset: "Reset to Default",

    // Auth
    login_title: "VSTEP Speaking Pro",
    login_subtitle: "AI Assessment Suite v3.0 (React Edition)",
    login_password_label: "Teacher Password",
    login_password_placeholder: "Enter password...",
    login_btn: "Login",
    login_error_wrong: "Incorrect password. Please try again.",
    login_error_network: "Cannot connect to Backend (:8000). Please check server."
  }
};

export const RUBRIC_PRESET_EN = {
  version: "2.0",
  name: "Official VSTEP Speaking Rubric (5 Criteria)",
  description: "Standard 5-criteria assessment rubric aligned with CEFR B1-B2-C1 speaking proficiency levels.",
  settings: {
    examiner_strictness: "standard",
    feedback_language: "en",
    max_feedback_items: 4,
    wpm_range: { min: 110, max: 150 }
  },
  criteria: {
    grammar: {
      name: "Grammatical Range & Accuracy",
      weight: 0.20,
      description: "Accurate use of syntactic structures, tense variety, error control, and complex sentence handling.",
      band_descriptors: {
        c1: "Consistently maintains high grammatical accuracy; exhibits flexible use of complex structures with rare and non-systematic errors.",
        b2: "Shows good grammatical control; uses a variety of compound and complex sentences with occasional minor errors that do not impede communication.",
        b1: "Uses simple structures with reasonable accuracy; makes grammatical slips when attempting complex forms, yet basic meaning remains clear."
      }
    },
    vocabulary: {
      name: "Lexical Resource & Vocabulary",
      weight: 0.20,
      description: "Range and precision of vocabulary, idiomatic expressions, collocations, context suitability, and paraphrasing.",
      band_descriptors: {
        c1: "Demonstrates an extensive lexical repertoire; uses idiomatic and academic vocabulary naturally and precisely across complex topics.",
        b2: "Possesses a varied vocabulary to discuss topics flexibly; employs appropriate collocations and paraphrasing with few inappropriate word choices.",
        b1: "Sufficient vocabulary for routine situations; tends to rely on basic vocabulary with noticeable repetition."
      }
    },
    pronunciation: {
      name: "Pronunciation & Intonation",
      weight: 0.20,
      description: "Phonological clarity, individual sounds, final consonants, word stress, sentence rhythm, and natural connected speech.",
      band_descriptors: {
        c1: "Pronunciation is clear, natural, and effortless to understand; displays sophisticated rhythm, word stress, and expressive intonation.",
        b2: "Generally clear pronunciation with noticeable intonation; occasional minor accent or stress lapses do not obscure overall intelligibility.",
        b1: "Intelligible pronunciation; occasional mispronunciations of difficult words, unclear final consonants, or monotone delivery."
      }
    },
    fluency: {
      name: "Fluency & Coherence",
      weight: 0.20,
      description: "Speaking rate, speech continuity, minimal hesitation, logical sequencing, and effective discourse markers.",
      band_descriptors: {
        c1: "Speaks fluently with an effortless, natural flow; sustained standard speech rate (120-150 WPM) with virtually no speech-related hesitation.",
        b2: "Speaks at a steady pace with minor hesitation for language formulation; ideas are coherently linked using cohesive devices.",
        b1: "Can maintain speech on familiar topics, but notable hesitation and pauses are needed to plan structures and retrieve words."
      }
    },
    topic_development: {
      name: "Topic Development & Structure",
      weight: 0.20,
      description: "Relevance, elaboration with details/examples, logical organization, and cohesive discourse markers.",
      band_descriptors: {
        c1: "Fully develops ideas with relevant elaboration and appropriate conclusions; coherent structure with sophisticated cohesive devices.",
        b2: "Develops topics clearly with supporting details and examples; uses a range of cohesive devices to clearly mark relationships between ideas.",
        b1: "Addresses topics appropriately; attempts to expand ideas using simple connectors, though sometimes repetitive."
      }
    }
  }
};

export const RUBRIC_PRESET_VI = {
  version: "2.0",
  name: "Barem Tiêu Chí Chấm Điểm Bài Thi Nói VSTEP – Bậc 3-5 (Bộ GD&ĐT)",
  description: "Barem chấm thi Nói VSTEP chính thức của Bộ GD&ĐT gồm 5 tiêu chí: Ngữ pháp, Từ vựng, Phát âm, Độ lưu loát, Bố cục nội dung theo thang điểm 0-10.",
  settings: {
    examiner_strictness: "standard",
    feedback_language: "vi",
    max_feedback_items: 4,
    wpm_range: { min: 110, max: 150 }
  },
  criteria: {
    grammar: {
      name: "Ngữ pháp (Grammar & Accuracy)",
      weight: 0.20,
      description: "Độ chính xác ngữ pháp, đa dạng cấu trúc câu đơn/phức, khả năng kiểm soát lỗi và tự sửa lỗi.",
      band_descriptors: {
        c1: "Sử dụng linh hoạt nhiều cấu trúc phức tạp, hiếm khi mắc lỗi, kiểm soát ngữ pháp hoàn hảo.",
        b2: "Sử dụng tốt câu ghép và câu phức, có thể mắc lỗi nhỏ khi diễn đạt ý phức tạp nhưng không gây hiểu lầm.",
        b1: "Kiểm soát tốt câu đơn, còn mắc lỗi cấu trúc khi cố dùng câu phức nhưng vẫn truyền đạt được ý chính."
      }
    },
    vocabulary: {
      name: "Từ vựng (Vocabulary & Resource)",
      weight: 0.20,
      description: "Vốn từ vựng, độ chính xác ngữ cảnh, sử dụng thành ngữ, collocations và từ liên kết.",
      band_descriptors: {
        c1: "Vốn từ phong phú, dùng từ tự nhiên, chính xác, linh hoạt theo ngữ cảnh chủ đề chuyên sâu.",
        b2: "Vốn từ tương đối đa dạng, dùng được từ học thuật hoặc collocations, đôi khi chưa thật chuẩn xác.",
        b1: "Vốn từ đủ để giao tiếp hàng ngày, còn lặp từ hoặc phụ thuộc vào từ ngữ đơn giản."
      }
    },
    pronunciation: {
      name: "Phát âm (Pronunciation & Intonation)",
      weight: 0.20,
      description: "Phát âm rõ ràng, nguyên âm/phụ âm, trọng âm từ, nối âm và ngữ điệu tự nhiên.",
      band_descriptors: {
        c1: "Phát âm chuẩn, rõ âm đuôi, ngữ điệu tự nhiên, dễ nghe và giàu cảm xúc.",
        b2: "Phát âm rõ ràng, người nghe dễ hiểu, có ngữ điệu nhưng đôi lúc còn hơi gượng.",
        b1: "Phát âm chấp nhận được, có thể sót âm đuôi hoặc sai trọng âm ở một số từ khó."
      }
    },
    fluency: {
      name: "Trôi chảy (Fluency & Coherence)",
      weight: 0.20,
      description: "Tốc độ nói, độ liền mạch, ít ậm ừ ngập ngừng, phân bổ thời gian và liên kết ý logic.",
      band_descriptors: {
        c1: "Nói trôi chảy tự nhiên, tốc độ chuẩn (120-150 WPM), không có khoảng lặng ngập ngừng đáng kể.",
        b2: "Nói liền mạch, đôi lúc ngập ngừng tìm từ nhưng không làm gián đoạn bài thi.",
        b1: "Nói chậm hoặc ngắt quãng, còn nhiều khoảng ngừng ngập ngừng để nghĩ từ và cấu trúc."
      }
    },
    topic_development: {
      name: "Bố cục nội dung (Topic Development)",
      weight: 0.20,
      description: "Mức độ phù hợp với câu hỏi, phát triển ý bằng chi tiết/ví dụ, cấu trúc chặt chẽ và sử dụng phương tiện liên kết.",
      band_descriptors: {
        c1: "Phát triển ý một cách tường tận, đưa ra ví dụ minh họa và kết luận phù hợp; trình bày mạch lạc, sử dụng thành thạo các phương tiện kết nối.",
        b2: "Phát triển ý tương đối dễ dàng với chi tiết và ví dụ phù hợp; sử dụng nhiều loại phương tiện kết nối thể hiện rõ quan hệ giữa các ý.",
        b1: "Trả lời phù hợp các câu hỏi, có cố gắng mở rộng ý và liên kết ý bằng các phương tiện kết nối đơn giản."
      }
    }
  }
};
