/**
 * VSTEP Speaking Pro - Bilingual Translation Dictionary & Rubric Presets
 * Supports Vietnamese (vi) and English (en) with academic examination terminology.
 */

window.I18N_TRANSLATIONS = {
    vi: {
        // --- Navbar ---
        app_title: "VSTEP Speaking Pro",
        theme_toggle_title: "Chuyển chế độ sáng/tối",
        sidebar_toggle_title: "Mở thanh chức năng",
        lang_vi: "Tiếng Việt",
        lang_en: "English (UK/US)",

        // --- Sidebar ---
        sidebar_menu_title: "Menu Chức Năng",
        sidebar_close_title: "Thu gọn thanh bên",
        sidebar_section_tools: "Công Cụ Đánh Giá",
        sidebar_batch_title: "Chấm điểm hàng loạt",
        sidebar_batch_desc: "Nhiều file WAV, MP3",
        sidebar_btn_open: "Mở",
        sidebar_rubric_title: "Cấu hình Rubric",
        sidebar_rubric_desc: "Trọng số, Thang B1-B2-C1",
        sidebar_section_upcoming: "Tính năng mở rộng",
        sidebar_qbank_title: "Ngân hàng đề thi",
        sidebar_qbank_desc: "Đề thi mẫu Part 1, 2, 3",
        sidebar_status_soon: "Sắp có",
        sidebar_analytics_title: "Thống kê & Tiến độ",
        sidebar_analytics_desc: "Biểu đồ Band score & WPM",
        sidebar_ai_engine_title: "Cấu hình AI Engine",
        sidebar_ai_engine_desc: "LM Studio / Gemini API",
        sidebar_status_dev: "Đang phát triển",
        sidebar_suite: "AI Assessment Suite",

        // --- Evaluation & History (Left Col) ---
        tab_feedback: "Kết quả Đánh giá",
        tab_history: "Lịch sử",
        overall_score_label: "Điểm tổng quan:",
        criterion_grammar: "Ngữ pháp",
        criterion_vocab: "Từ vựng",
        criterion_pronun: "Phát âm",
        criterion_fluency: "Trôi chảy",
        feedback_header: "Nhận xét & Khắc phục:",
        feedback_empty: "Hoàn thành bài thi để xem AI phân tích chi tiết lỗi sai của bạn tại đây.",
        model_answer_header: "Bài nói mẫu (Band 9-10):",
        model_answer_empty: "Bài nói mẫu sẽ hiển thị sau khi bạn nộp bài...",
        btn_retry: "Luyện tập đề khác",
        history_empty: "Chưa có dữ liệu lịch sử luyện tập.",

        // --- Practice Area (Right Col) ---
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
        btn_upload_audio: "Tải file âm thanh (.mp3, .wav) lên",

        // --- Batch Modal ---
        batch_modal_title: "Chấm điểm hàng loạt",
        batch_modal_alert: "Tính năng này giúp bạn tải lên cùng lúc nhiều file âm thanh. Hệ thống sẽ tự động chấm điểm từng file một và lưu toàn bộ kết quả vào mục Lịch sử.",
        batch_step1_title: "1. Cấu hình Đề bài (Áp dụng cho tất cả các file)",
        batch_part_label: "Chọn Phần Thi",
        batch_topic_label: "Nội dung đề bài",
        batch_upload_txt_title: "Tải file .txt lên",
        batch_step2_title: "2. Tải lên File Âm Thanh",
        batch_btn_select: "Chọn nhiều file âm thanh",
        batch_no_files: "Chưa chọn file nào.",
        batch_progress_title: "Tiến trình chấm điểm:",
        batch_file_details: "Chi tiết các file",
        batch_btn_close: "Đóng",
        batch_btn_start: "Bắt đầu chấm",

        // --- Rubric Modal ---
        rubric_modal_title: "Cấu hình Rubric Chấm điểm VSTEP",
        rubric_modal_subtitle: "Tùy chỉnh trọng số, tiêu chuẩn band điểm B1 - B2 - C1 và phong cách giám khảo AI",
        rubric_preset_label: "Mẫu chuẩn ngôn ngữ:",
        rubric_preset_en_btn: "🇬BY Tiếng Anh (CEFR)",
        rubric_preset_vi_btn: "🇻🇳 Tiếng Việt (Bản ngữ)",
        rubric_tab_weights: "1. Tiêu chí & Trọng số",
        rubric_tab_descriptors: "2. Barem mốc điểm (B1 - B2 - C1)",
        rubric_tab_settings: "3. Giám khảo AI & Tốc độ WPM",
        rubric_total_weight_label: "Tổng trọng số tính điểm:",
        rubric_balance_btn: "Chia đều (25%)",
        rubric_balance_btn_title: "Chia đều mỗi tiêu chí 25% để đạt chuẩn 100%",
        rubric_total_valid: "100% (Hợp lệ)",
        rubric_total_invalid_suffix: "(Chưa đúng 100%)",
        rubric_alert_ready: "Tổng trọng số chuẩn 100%. Đã sẵn sàng lưu cấu hình!",
        rubric_alert_error_prefix: "Tổng trọng số hiện tại là ",
        rubric_alert_error_suffix: "%. Vui lòng điều chỉnh lại cho đủ 100% để lưu.",
        rubric_crit_desc_label: "Mô tả tiêu chí:",
        rubric_desc_info: "Mô tả tiêu chuẩn kỳ vọng của từng mức điểm VSTEP. Đoạn mô tả này được nạp trực tiếp vào Prompt của AI để phân cấp điểm chính xác.",
        rubric_desc_grammar_title: "Tiêu chuẩn mốc điểm: Ngữ pháp (Grammar)",
        rubric_desc_vocab_title: "Tiêu chuẩn mốc điểm: Từ vựng (Vocabulary)",
        rubric_desc_pronun_title: "Tiêu chuẩn mốc điểm: Phát âm (Pronunciation)",
        rubric_desc_fluency_title: "Tiêu chuẩn mốc điểm: Trôi chảy (Fluency)",
        rubric_band_c1: "Band C1 (8.5 - 10.0)",
        rubric_band_b2: "Band B2 (6.0 - 8.0)",
        rubric_band_b1: "Band B1 (4.0 - 5.5)",
        rubric_settings_sec1: "1. Thiết lập phong cách Giám khảo AI",
        rubric_strictness_label: "Mức độ khắt khe (Strictness)",
        rubric_strictness_standard: "Chuẩn VSTEP (Standard - Khuyên dùng)",
        rubric_strictness_strict: "Khắt khe (Strict - Siết chặt lỗi cho mục tiêu C1)",
        rubric_strictness_lenient: "Khuyến khích (Lenient - Nhẹ tay cho người mới B1)",
        rubric_lang_label: "Ngôn ngữ nhận xét (Detailed Feedback)",
        rubric_lang_vi: "Tiếng Việt (Rõ ràng, dễ tiếp thu)",
        rubric_lang_en: "English (Chuẩn khảo thí quốc tế)",
        rubric_max_errors_label: "Số lỗi tối đa cần chỉ ra",
        rubric_max_errors_hint: "Khuyến nghị từ 2 đến 4 lỗi để phản hồi có trọng tâm.",
        rubric_settings_sec2: "2. Ngưỡng Tốc độ nói chuẩn (WPM)",
        rubric_min_wpm_label: "Tốc độ tối thiểu (Min WPM)",
        rubric_min_wpm_hint: "Nói chậm hơn ngưỡng này sẽ bị nhắc nhở về độ trôi chảy.",
        rubric_max_wpm_label: "Tốc độ tối đa (Max WPM)",
        rubric_max_wpm_hint: "Nói nhanh hơn ngưỡng này AI sẽ khuyên nhả chữ rõ ràng hơn.",
        rubric_btn_reset: "Khôi phục mặc định",
        rubric_btn_reset_title: "Khôi phục barem VSTEP gốc",
        rubric_btn_export: "Xuất file JSON",
        rubric_btn_export_title: "Tải file JSON về máy",
        rubric_btn_import: "Nhập file JSON",
        rubric_btn_import_title: "Nhập cấu hình từ file JSON",
        rubric_btn_close: "Đóng",
        rubric_btn_save: "Lưu cấu hình",

        // --- Dialogs & Notifications ---
        msg_mic_denied: "Không thể truy cập Microphone! Vui lòng cho phép truy cập micro trên trình duyệt để ghi âm.",
        msg_evaluating: "Hệ thống đang chuyển giọng nói thành văn bản và nhờ AI phân tích điểm... Vui lòng đợi trong giây lát.",
        msg_topic_registered: "Đã ghi nhận đề bài thành công!",
        msg_rubric_saved: "Đã cập nhật Rubric chấm điểm VSTEP thành công! Hệ thống sẽ áp dụng barem này cho các lượt chấm tiếp theo.",
        msg_rubric_reset_confirm: "Bạn có chắc chắn muốn khôi phục toàn bộ Rubric về chuẩn mặc định không?",
        msg_rubric_reset_success: "Đã khôi phục Rubric về chuẩn mặc định thành công!",
        msg_rubric_weight_invalid: "Tổng trọng số của 4 tiêu chí hiện chưa đủ 100%. Vui lòng điều chỉnh lại hoặc bấm 'Chia đều (25%)'.",
        msg_preset_confirm: "Áp dụng bộ mẫu mới sẽ thay đổi nội dung các ô tiêu chí và band điểm hiện tại. Bạn có muốn tiếp tục?",
        msg_preset_loaded_en: "Đã nạp bộ Barem Tiếng Anh chuẩn CEFR! Bấm 'Lưu cấu hình' để áp dụng cho AI.",
        msg_preset_loaded_vi: "Đã nạp bộ Barem Tiếng Việt bản ngữ! Bấm 'Lưu cấu hình' để áp dụng cho AI.",

        // --- Auth & New UI ---
        login_password_label: "Mật khẩu giảng viên",
        login_password_placeholder: "Nhập mật khẩu...",
        login_btn: "Đăng nhập",
        login_error_wrong: "Mật khẩu không đúng. Vui lòng thử lại.",
        sidebar_user_label: "Giảng viên",
        nav_grade: "Chấm điểm đơn",
        nav_batch: "Chấm hàng loạt",
        nav_compare: "So sánh AI vs GV",
        badge_new: "Mới",
        nav_history: "Lịch sử",
        sidebar_section_config: "Cấu hình",
        nav_rubric: "Cấu hình Rubric",
        logout_btn: "Đăng xuất",
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
        compare_gv_note: "* Cột GV* = điểm từng tiêu chí ước tính (đồng đều từ điểm tổng GV). Nhập điểm GV bên cột 'Điểm GV' để tính khớp %.",
        chart_title: "Biểu đồ AI vs Giáo Viên"
    },

    en: {
        // --- Navbar ---
        app_title: "VSTEP Speaking Pro",
        theme_toggle_title: "Switch Light/Dark Mode",
        sidebar_toggle_title: "Toggle Feature Menu",
        lang_vi: "Tiếng Việt (Vietnamese)",
        lang_en: "English (UK/US)",

        // --- Sidebar ---
        sidebar_menu_title: "Feature Menu",
        sidebar_close_title: "Collapse sidebar",
        sidebar_section_tools: "Assessment Tools",
        sidebar_batch_title: "Batch Assessment",
        sidebar_batch_desc: "Bulk WAV, MP3 scoring",
        sidebar_btn_open: "Open",
        sidebar_rubric_title: "Rubric Settings",
        sidebar_rubric_desc: "Weights, CEFR B1-C1 Bands",
        sidebar_section_upcoming: "Upcoming Modules",
        sidebar_qbank_title: "Question Bank",
        sidebar_qbank_desc: "Sample Part 1, 2, 3 Prompts",
        sidebar_status_soon: "Soon",
        sidebar_analytics_title: "Progress & Analytics",
        sidebar_analytics_desc: "Band Score & WPM Charts",
        sidebar_ai_engine_title: "AI Engine Setup",
        sidebar_ai_engine_desc: "LM Studio / Gemini API",
        sidebar_status_dev: "In Development",
        sidebar_suite: "AI Assessment Suite",

        // --- Evaluation & History (Left Col) ---
        tab_feedback: "Evaluation Results",
        tab_history: "History Log",
        overall_score_label: "Overall Score:",
        criterion_grammar: "Grammar",
        criterion_vocab: "Vocabulary",
        criterion_pronun: "Pronunciation",
        criterion_fluency: "Fluency",
        feedback_header: "Detailed Feedback & Suggestions:",
        feedback_empty: "Complete your speaking test to view detailed AI error analysis here.",
        model_answer_header: "Model Answer (Band 9-10):",
        model_answer_empty: "Model answer will appear here once you submit your speech...",
        btn_retry: "Practice Another Topic",
        history_empty: "No practice history recorded yet.",

        // --- Practice Area (Right Col) ---
        practice_area_title: "Test Area",
        exam_part_label: "Select Exam Part (Auto-adjusts timer)",
        exam_part_1: "Part 1: Social Interaction (3 Mins)",
        exam_part_2: "Part 2: Solution Discussion (3 Mins)",
        exam_part_3: "Part 3: Topic Development (4 Mins)",
        topic_hint: "Press Enter to register topic",
        live_listening: "AI is listening...",
        live_waiting: "Waiting for speech...",
        btn_record_start: "Start Recording",
        btn_record_stop: "Stop Recording & Evaluate",
        btn_upload_audio: "Upload Audio File (.mp3, .wav)",

        // --- Batch Modal ---
        batch_modal_title: "Batch Assessment",
        batch_modal_alert: "This feature allows uploading multiple audio recordings at once. The AI will evaluate each file consecutively and store all results in the History log.",
        batch_step1_title: "1. Topic Configuration (Applies to all files)",
        batch_part_label: "Select Exam Part",
        batch_topic_label: "Topic Prompt Content",
        batch_upload_txt_title: "Upload .txt topic file",
        batch_step2_title: "2. Upload Audio Files",
        batch_btn_select: "Select Multiple Audio Files",
        batch_no_files: "No files selected yet.",
        batch_progress_title: "Evaluation Progress:",
        batch_file_details: "File Status Details",
        batch_btn_close: "Close",
        batch_btn_start: "Start Batch Scoring",

        // --- Rubric Modal ---
        rubric_modal_title: "VSTEP Assessment Rubric Settings",
        rubric_modal_subtitle: "Customize criteria weights, CEFR B1-B2-C1 band benchmarks, and AI examiner style",
        rubric_preset_label: "Benchmark Presets:",
        rubric_preset_en_btn: "🇬🇧 English (CEFR Standard)",
        rubric_preset_vi_btn: "🇻🇳 Vietnamese (Bản ngữ)",
        rubric_tab_weights: "1. Criteria & Weights",
        rubric_tab_descriptors: "2. Band Descriptors (B1 - B2 - C1)",
        rubric_tab_settings: "3. AI Examiner & WPM Settings",
        rubric_total_weight_label: "Total Weighted Score:",
        rubric_balance_btn: "Balance (25%)",
        rubric_balance_btn_title: "Equally distribute 25% to each criterion to reach 100%",
        rubric_total_valid: "100% (Valid)",
        rubric_total_invalid_suffix: "(Must be 100%)",
        rubric_alert_ready: "Total weight equals 100%. Ready to save configuration!",
        rubric_alert_error_prefix: "Current total weight is ",
        rubric_alert_error_suffix: "%. Please adjust to exactly 100% to save.",
        rubric_crit_desc_label: "Criterion Description:",
        rubric_desc_info: "Expected performance benchmarks for each VSTEP band level. These descriptions are fed directly into the AI Examiner Prompt.",
        rubric_desc_grammar_title: "Band Benchmarks: Grammar & Accuracy",
        rubric_desc_vocab_title: "Band Benchmarks: Lexical Resource",
        rubric_desc_pronun_title: "Band Benchmarks: Pronunciation & Intonation",
        rubric_desc_fluency_title: "Band Benchmarks: Fluency & Coherence",
        rubric_band_c1: "Band C1 (8.5 - 10.0)",
        rubric_band_b2: "Band B2 (6.0 - 8.0)",
        rubric_band_b1: "Band B1 (4.0 - 5.5)",
        rubric_settings_sec1: "1. AI Examiner Style Configuration",
        rubric_strictness_label: "Examiner Strictness",
        rubric_strictness_standard: "VSTEP Standard (Balanced - Recommended)",
        rubric_strictness_strict: "Strict (High rigor for C1 target)",
        rubric_strictness_lenient: "Lenient (Encouraging for B1 beginners)",
        rubric_lang_label: "Feedback Commentary Language",
        rubric_lang_vi: "Vietnamese (Clear & Accessible)",
        rubric_lang_en: "English (Academic & International)",
        rubric_max_errors_label: "Maximum Error Points to Highlight",
        rubric_max_errors_hint: "Recommended 2 to 4 items for focused and actionable feedback.",
        rubric_settings_sec2: "2. Speaking Rate Benchmarks (WPM)",
        rubric_min_wpm_label: "Minimum Pace (Min WPM)",
        rubric_min_wpm_hint: "Speaking slower than this pace will trigger fluency pacing warnings.",
        rubric_max_wpm_label: "Maximum Pace (Max WPM)",
        rubric_max_wpm_hint: "Speaking faster than this pace will prompt advice to enunciate clearly.",
        rubric_btn_reset: "Reset to Default",
        rubric_btn_reset_title: "Reset to official default benchmarks",
        rubric_btn_export: "Export JSON",
        rubric_btn_export_title: "Export configuration to JSON file",
        rubric_btn_import: "Import JSON",
        rubric_btn_import_title: "Import configuration from JSON file",
        rubric_btn_close: "Close",
        rubric_btn_save: "Save Configuration",

        // --- Dialogs & Notifications ---
        msg_mic_denied: "Microphone access denied! Please enable microphone permissions in your browser.",
        msg_evaluating: "Transcribing audio and analyzing speech with AI... Please wait a moment.",
        msg_topic_registered: "New topic registered successfully!",
        msg_rubric_saved: "VSTEP Speaking Rubric saved successfully! New benchmarks will apply to all subsequent evaluations.",
        msg_rubric_reset_confirm: "Are you sure you want to reset the entire Rubric to default benchmarks?",
        msg_rubric_reset_success: "Rubric reset to default benchmarks successfully!",
        msg_rubric_weight_invalid: "Total criteria weight must equal exactly 100%. Please adjust or click 'Balance (25%)'.",
        msg_preset_confirm: "Applying this template will overwrite current criteria descriptions and band descriptors. Continue?",
        msg_preset_loaded_en: "Official CEFR English Rubric loaded! Click 'Save Configuration' to apply.",
        msg_preset_loaded_vi: "Vietnamese Rubric preset loaded! Click 'Save Configuration' to apply.",

        // --- Auth & New UI ---
        login_password_label: "Teacher Password",
        login_password_placeholder: "Enter password...",
        login_btn: "Login",
        login_error_wrong: "Incorrect password. Please try again.",
        sidebar_user_label: "Teacher",
        nav_grade: "Single Grade",
        nav_batch: "Batch Grade",
        nav_compare: "AI vs Teacher",
        badge_new: "New",
        nav_history: "History",
        sidebar_section_config: "Configuration",
        nav_rubric: "Rubric Config",
        logout_btn: "Logout",
        compare_title: "AI vs Teacher Comparison",
        compare_subtitle: "Enter teacher scores to compare with AI results and analyze agreement levels.",
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
        compare_gv_note: "* Teacher* = estimated criteria score (distributed evenly). Enter Teacher Score to calculate Match %.",
        chart_title: "AI vs Teacher Chart"
    }
};

// --- PRESET DATA COPIES FOR CLIENT-SIDE SWITCHING ---
window.RUBRIC_PRESET_EN = {
    version: "1.0",
    name: "Official VSTEP Speaking Rubric (CEFR Benchmark)",
    description: "Standard four-criteria assessment rubric aligned with CEFR B1-B2-C1 speaking proficiency levels.",
    settings: {
        examiner_strictness: "standard",
        feedback_language: "en",
        max_feedback_items: 3,
        wpm_range: { min: 110, max: 150 }
    },
    criteria: {
        grammar: {
            name: "Grammatical Range & Accuracy",
            weight: 0.25,
            description: "Accurate use of syntactic structures, tense variety, error control, and complex sentence handling.",
            band_descriptors: {
                c1: "Consistently maintains high grammatical accuracy; exhibits flexible use of complex structures with rare and non-systematic errors.",
                b2: "Shows good grammatical control; uses a variety of compound and complex sentences with occasional minor errors that do not impede communication.",
                b1: "Uses simple structures with reasonable accuracy; makes grammatical slips when attempting complex forms, yet basic meaning remains clear."
            }
        },
        vocabulary: {
            name: "Lexical Resource & Vocabulary",
            weight: 0.25,
            description: "Range and precision of vocabulary, idiomatic expressions, collocations, context suitability, and paraphrasing.",
            band_descriptors: {
                c1: "Demonstrates an extensive lexical repertoire; uses idiomatic and academic vocabulary naturally and precisely across complex topics.",
                b2: "Possesses a varied vocabulary to discuss topics flexibly; employs appropriate collocations and paraphrasing with few inappropriate word choices.",
                b1: "Sufficient vocabulary for routine situations; tends to rely on basic vocabulary with noticeable repetition."
            }
        },
        pronunciation: {
            name: "Pronunciation & Intonation",
            weight: 0.25,
            description: "Phonological clarity, individual sounds, final consonants, word stress, sentence rhythm, and natural connected speech.",
            band_descriptors: {
                c1: "Pronunciation is clear, natural, and effortless to understand; displays sophisticated rhythm, word stress, and expressive intonation.",
                b2: "Generally clear pronunciation with noticeable intonation; occasional minor accent or stress lapses do not obscure overall intelligibility.",
                b1: "Intelligible pronunciation; occasional mispronunciations of difficult words, unclear final consonants, or monotone delivery."
            }
        },
        fluency: {
            name: "Fluency & Coherence",
            weight: 0.25,
            description: "Speaking rate, speech continuity, minimal hesitation, logical sequencing, and effective discourse markers.",
            band_descriptors: {
                c1: "Speaks fluently with an effortless, natural flow; sustained standard speech rate (120-150 WPM) with virtually no speech-related hesitation.",
                b2: "Speaks at a steady pace with minor hesitation for language formulation; ideas are coherently linked using cohesive devices.",
                b1: "Can maintain speech on familiar topics, but notable hesitation and pauses are needed to plan structures and retrieve words."
            }
        }
    }
};

window.RUBRIC_PRESET_VI = {
    version: "1.0",
    name: "Chuẩn VSTEP B1-B2-C1 (Tiếng Việt)",
    description: "Barem tiêu chuẩn chính thức của kỳ thi VSTEP Speaking 4 tiêu chí bản ngữ hóa.",
    settings: {
        examiner_strictness: "standard",
        feedback_language: "vi",
        max_feedback_items: 3,
        wpm_range: { min: 110, max: 150 }
    },
    criteria: {
        grammar: {
            name: "Ngữ pháp (Grammar & Accuracy)",
            weight: 0.25,
            description: "Độ chính xác ngữ pháp, đa dạng cấu trúc câu đơn/phức, khả năng kiểm soát lỗi.",
            band_descriptors: {
                c1: "Sử dụng linh hoạt nhiều cấu trúc phức tạp, hiếm khi mắc lỗi, kiểm soát ngữ pháp hoàn hảo.",
                b2: "Sử dụng tốt câu ghép và câu phức, có thể mắc lỗi nhỏ khi diễn đạt ý phức tạp nhưng không gây hiểu lầm.",
                b1: "Kiểm soát tốt câu đơn, còn mắc lỗi cấu trúc khi cố dùng câu phức nhưng vẫn truyền đạt được ý chính."
            }
        },
        vocabulary: {
            name: "Từ vựng (Vocabulary & Resource)",
            weight: 0.25,
            description: "Vốn từ vựng, độ chính xác ngữ cảnh, sử dụng thành ngữ, collocations và từ liên kết.",
            band_descriptors: {
                c1: "Vốn từ phong phú, dùng từ tự nhiên, chính xác, linh hoạt theo ngữ cảnh chủ đề chuyên sâu.",
                b2: "Vốn từ tương đối đa dạng, dùng được từ học thuật hoặc collocations, đôi khi chưa thật chuẩn xác.",
                b1: "Vốn từ đủ để giao tiếp hàng ngày, còn lặp từ hoặc phụ thuộc vào từ ngữ đơn giản."
            }
        },
        pronunciation: {
            name: "Phát âm (Pronunciation & Intonation)",
            weight: 0.25,
            description: "Phát âm rõ ràng, nguyên âm/phụ âm, trọng âm từ, nối âm và ngữ điệu tự nhiên.",
            band_descriptors: {
                c1: "Phát âm chuẩn, rõ âm đuôi, ngữ điệu tự nhiên, dễ nghe và giàu cảm xúc.",
                b2: "Phát âm rõ ràng, người nghe dễ hiểu, có ngữ điệu nhưng đôi lúc còn hơi gượng.",
                b1: "Phát âm chấp nhận được, có thể sót âm đuôi hoặc sai trọng âm ở một số từ khó."
            }
        },
        fluency: {
            name: "Trôi chảy (Fluency & Coherence)",
            weight: 0.25,
            description: "Tốc độ nói, độ liền mạch, ít ậm ừ ngập ngừng, phân bổ thời gian và liên kết ý logic.",
            band_descriptors: {
                c1: "Nói trôi chảy tự nhiên, tốc độ chuẩn (120-150 WPM), không có khoảng lặng ngập ngừng đáng kể.",
                b2: "Nói liền mạch, đôi lúc ngập ngừng tìm từ nhưng không làm gián đoạn bài thi.",
                b1: "Nói chậm hoặc ngắt quãng, còn nhiều khoảng ngừng ngập ngừng để nghĩ từ và cấu trúc."
            }
        }
    }
};
