/**
 * Dữ liệu Barem Tiêu Chí Chấm Điểm Bài Thi Nói VSTEP - Bậc 3-5 (Phần 1, 2 và 3)
 * Văn bản chính thức từ Bộ Giáo dục & Đào tạo Việt Nam
 * Song ngữ: Tiếng Việt (Nguyên văn) & Tiếng Anh (CEFR Benchmark)
 */

export const VSTEP_OFFICIAL_MATRIX_VI = {
  title: "TIÊU CHÍ CHẤM ĐIỂM BÀI THI NÓI VSTEP – BẬC 3-5 (PHẦN 1, 2 và 3)",
  source: "Bộ Giáo dục và Đào tạo",
  scores: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  criteria: [
    {
      id: "grammar",
      name: "Ngữ pháp",
      sub_criteria: ["Phạm vi", "Độ chính xác"],
      icon: "📜",
      color: "#f59e0b",
      descriptors: {
        0: "Thí sinh không dự thi.",
        1: "Chỉ sử dụng được một cách hạn chế một số cấu trúc ngữ pháp và mẫu câu đơn giản đã học.",
        2: "Sử dụng chính xác một số cấu trúc đơn giản nhưng vẫn mắc các lỗi cơ bản một cách hệ thống; tuy nhiên, người sử dụng vẫn thể hiện được ý mình muốn truyền đạt.",
        3: "Sử dụng một cách khá chính xác các dạng câu đơn thường dùng trong những tình huống quen thuộc, tuy có thể còn mắc nhiều lỗi nhưng người sử dụng vẫn thể hiện được ý một cách rõ ràng.",
        4: "Sử dụng một cách chính xác các dạng câu đơn thường dùng trong những tình huống quen thuộc, tuy có thể còn mắc một số lỗi nhưng người sử dụng vẫn thể hiện được ý một cách rõ ràng.",
        5: "• Sử dụng một cách chính xác các dạng câu đơn thường dùng trong những tình huống quen thuộc, tuy có thể còn mắc một số lỗi nhưng người sử dụng vẫn thể hiện được ý một cách rõ ràng.\n• Có nỗ lực sử dụng những mẫu câu phức tuy còn mắc nhiều lỗi.",
        6: "Sử dụng linh hoạt và chính xác câu đơn và một số câu phức, tuy còn mắc một số lỗi sai nhưng không dẫn đến hiểu nhầm.",
        7: "Sử dụng linh hoạt và chính xác câu đơn và khá nhiều câu phức, tuy còn mắc một số lỗi sai trong diễn đạt một cách không hệ thống.",
        8: "Sử dụng linh hoạt và chính xác câu đơn và khá nhiều câu phức, tuy còn mắc một số lỗi sai nhưng có thể tự sửa được ngay.",
        9: "Sử dụng linh hoạt và chính xác nhiều cấu trúc câu đa dạng, tuy đôi khi còn mắc lỗi nhưng khó phát hiện.",
        10: "Sử dụng linh hoạt và chính xác nhiều cấu trúc câu đa dạng và hầu như không mắc lỗi."
      }
    },
    {
      id: "vocabulary",
      name: "Từ vựng",
      sub_criteria: ["Phạm vi", "Kiểm soát"],
      icon: "📚",
      color: "#3b82f6",
      descriptors: {
        0: "Thí sinh không dự thi.",
        1: "Chỉ sử dụng được một số từ, cụm từ riêng lẻ về một số chủ đề rất quen thuộc.",
        2: "• Sử dụng được nhiều từ, cụm từ đơn giản về các chủ đề rất quen thuộc.\n• Chọn đúng từ và dạng thức của từ thuộc phạm vi từ nêu trên.",
        3: "Sử dụng được các từ vựng thuộc các chủ đề quen thuộc mặc dù thường xuyên lặp từ.",
        4: "• Sử dụng được các từ vựng thuộc các chủ đề quen thuộc và đôi lúc còn dùng lặp các từ vựng này.\n• Có nỗ lực sử dụng từ vựng thuộc các chủ đề không quen thuộc nhưng còn mắc nhiều lỗi về dùng từ.",
        5: "• Sử dụng được các từ vựng thuộc các chủ đề quen thuộc và đôi lúc còn dùng lặp các từ vựng này.\n• Có nỗ lực sử dụng từ vựng thuộc các chủ đề không quen thuộc nhưng còn mắc một số lỗi về dùng từ.",
        6: "• Sử dụng được các từ vựng thuộc về hầu hết các chủ đề quen thuộc và đôi lúc có nỗ lực tránh lặp từ khi sử dụng các từ vựng thuộc các chủ đề không quen thuộc.\n• Có độ chính xác từ vựng tương đối cao tuy vẫn còn lỗi về dùng từ và dạng thức từ.",
        7: "• Sử dụng được các từ vựng thuộc về hầu hết các chủ đề quen thuộc và có nỗ lực tránh lặp từ với khi sử dụng các từ vựng thuộc các chủ đề không quen thuộc.\n• Có độ chính xác từ vựng khá cao mặc dù vẫn lúng túng khi chọn từ và đôi lúc dùng từ còn sai.",
        8: "• Sử dụng được các từ vựng thuộc về hầu hết các chủ đề quen thuộc và rất nỗ lực tránh lặp từ khi sử dụng các từ vựng thuộc các chủ đề không quen thuộc.\n• Có nỗ lực trong việc sử dụng những từ ít quen thuộc và những cách diễn đạt kiểu thành ngữ.\n• Có độ chính xác từ vựng khá cao mặc dù vẫn lúng túng khi chọn từ và đôi lúc dùng từ còn sai.",
        9: "• Có lượng từ vựng lớn, gồm cả các từ không quen thuộc, các cách diễn đạt kiểu thành ngữ và lối nói thông tục.\n• Chủ động tìm những cách diễn đạt khác và/hoặc các cách nói tránh tuy đôi lúc còn ngập ngừng.\n• Đôi khi vẫn lỡ lời và vẫn mắc một vài lỗi từ vựng nhỏ.",
        10: "• Có lượng từ vựng lớn, gồm cả các từ không quen thuộc, các cách diễn đạt kiểu thành ngữ và lối nói thông tục.\n• Chủ động tìm những cách diễn đạt khác và/hoặc các cách nói tránh mà hầu như không ngập ngừng.\n• Hầu như không lỡ lời và không mắc những lỗi từ vựng nhỏ."
      }
    },
    {
      id: "pronunciation",
      name: "Phát âm",
      sub_criteria: ["Âm đơn lẻ", "Trọng âm", "Ngữ điệu"],
      icon: "🎙️",
      color: "#8b5cf6",
      descriptors: {
        0: "Thí sinh không dự thi.",
        1: "Phát âm được những từ và cụm từ rất đơn giản nhưng độ chính xác thấp, gây khó hiểu cho người nghe.",
        2: "Phát âm tương đối rõ ràng những từ và cụm từ đơn giản nhưng do đôi khi khó nghe nên người đối thoại vẫn phải yêu cầu nhắc lại.",
        3: "Phát âm rõ ràng và dễ hiểu những từ và cụm từ, tuy còn mắc khá nhiều lỗi về các âm đơn lẻ và các lỗi về âm khác.",
        4: "• Phát âm rõ ràng và dễ hiểu những từ và cụm từ, tuy đôi khi còn mắc lỗi về các âm đơn lẻ.\n• Có cố gắng nhấn trọng âm từ tuy còn sai nhiều.",
        5: "• Phát âm rõ ràng và dễ hiểu những từ và cụm từ, tuy đôi khi còn mắc một số lỗi về các âm đơn lẻ.\n• Có cố gắng nhấn trọng âm từ tuy còn chưa chính xác.",
        6: "• Phát âm rõ ràng, tự nhiên, và dễ hiểu.\n• Phát âm đơn lẻ hầu như rõ ràng, chính xác.\n• Nhấn trọng âm từ tương đối chính xác và đã thể hiện sự nỗ lực trong việc nhấn trọng âm câu và ngữ điệu câu.",
        7: "• Phát âm rõ ràng, tự nhiên, và dễ hiểu.\n• Phát âm đơn lẻ rõ ràng, chính xác.\n• Nhấn trọng âm từ và trọng âm câu tương đối chính xác.\n• Có nỗ lực trong việc thể hiện ngữ điệu câu.",
        8: "• Phát âm rõ ràng, tự nhiên, và dễ hiểu.\n• Phát âm đơn lẻ rõ ràng, chính xác.\n• Nhấn trọng âm từ và trọng âm câu tương đối chính xác.\n• Rất nỗ lực trong việc thể hiện ngữ điệu câu.",
        9: "• Phát âm, đặt trọng âm từ và câu chính xác.\n• Có ngữ điệu câu phù hợp.\n• Có thể thay đổi trọng âm câu để thể hiện các sắc thái ý nghĩa khác nhau.",
        10: "• Phát âm, đặt trọng âm từ và câu chính xác.\n• Có ngữ điệu câu phù hợp.\n• Có thể thay đổi trọng âm câu và ngữ điệu để thể hiện các sắc thái ý nghĩa khác nhau và các chức năng khác nhau của ngôn ngữ."
      }
    },
    {
      id: "fluency",
      name: "Độ lưu loát",
      sub_criteria: ["Ngập ngừng", "Nói dài"],
      icon: "⚡",
      color: "#10b981",
      descriptors: {
        0: "Thí sinh không dự thi.",
        1: "Chỉ có thể nói một cách rời rạc, ngập ngừng những từ và cụm từ rất ngắn, phần lớn là những câu đã học thuộc.",
        2: "Có thể nói những cụm từ và câu ngắn một cách rất chậm chạp, thường xuyên bị lỡ lời và phải nhắc lại.",
        3: "Có thể diễn đạt một cách khá trôi chảy những ý đơn giản, và hầu như không diễn đạt được ý phức tạp.",
        4: "• Có thể diễn đạt trôi chảy những ý đơn giản, và có cố gắng diễn đạt một số ý phức tạp nhưng còn chậm do phải tìm cấu trúc và từ vựng.\n• Biết sử dụng các cụm từ và câu đơn giản để kéo dài câu trả lời.",
        5: "• Có thể diễn đạt trôi chảy những ý đơn giản và diễn đạt được những ý phức tạp nhưng còn chậm do phải tìm cấu trúc và từ vựng.\n• Có thể nói các đoạn dài nhưng còn mắc lỗi sai và có dấu hiệu của sửa lỗi.",
        6: "• Có thể giao tiếp dễ dàng và tương đối lưu loát những ý đơn giản và phức tạp, có thể ngập ngừng nhưng không phải quá lâu để tìm cấu trúc và từ vựng.\n• Có thể nói các đoạn dài nhưng còn mắc một số lỗi không hệ thống và có dấu hiệu của sửa lỗi.",
        7: "• Có thể giao tiếp dễ dàng và tương đối lưu loát, đều đặn những ý đơn giản và phức tạp, đôi lúc còn ngập ngừng nhưng không phải quá lâu để tìm cấu trúc và từ vựng.\n• Có thể nói các đoạn dài nhưng đôi khi còn lặp từ và còn cần sửa lỗi.",
        8: "• Có thể giao tiếp dễ dàng, khá lưu loát, đều đặn những ý đơn giản và phức tạp, đôi lúc còn ngập ngừng, nhưng không phải mất thời gian để tìm cấu trúc và từ vựng.\n• Có thể nói các đoạn dài tuy còn mắc một số lỗi nhỏ.",
        9: "• Thường xuyên nói các đoạn dài và có thể diễn đạt ý một cách dễ dàng, lưu loát, tự nhiên, nhưng đôi khi còn hiện tượng lặp từ hay sửa lỗi.\n• Hầu như không có dấu hiệu về việc ngập ngừng để tìm từ và cấu trúc, chỉ ngập ngừng khi tìm ý để diễn đạt về một số chủ đề khó về mặt khái niệm.",
        10: "• Thường xuyên nói các đoạn dài và có thể diễn đạt ý một cách dễ dàng, lưu loát, tự nhiên, và hiếm khi có hiện tượng lặp từ hay sửa lỗi.\n• Không có dấu hiệu về việc ngập ngừng để tìm từ và cấu trúc, chỉ ngập ngừng khi tìm ý để diễn đạt về một số chủ đề khó về mặt khái niệm."
      }
    },
    {
      id: "topic_development",
      name: "Bố cục nội dung",
      sub_criteria: ["Phát triển chủ đề", "Tính mạch lạc và liên kết"],
      icon: "🎯",
      color: "#06b6d4",
      descriptors: {
        0: "Thí sinh không dự thi.",
        1: "• Hầu như không diễn đạt hoặc phát triển được ý.\n• Chỉ có thể liên kết từ và cụm từ bằng các từ kết nối như “và” hoặc “thì”.",
        2: "• Trả lời được câu hỏi nhưng nội dung trả lời chưa phù hợp và không phát triển được ý ngoài những từ khóa được gợi ý.\n• Có thể sử dụng một số phương tiện kết nối đơn giản như “và”, “nhưng”, “bởi vì”.",
        3: "• Trả lời tương đối phù hợp được các câu hỏi và có thể phát triển ý nhưng mới chỉ dưới dạng liệt kê.\n• Có thể liên kết ý bằng một số các phương tiện kết nối đơn giản nhưng hay bị lặp.",
        4: "• Trả lời phù hợp được các câu hỏi và thể hiện cố gắng phát triển ý nhưng chỉ dưới dạng liệt kê.\n• Có thể liên kết ý bằng một số các phương tiện kết nối đơn giản nhưng đôi khi bị lặp.",
        5: "• Trả lời phù hợp được các câu hỏi và có thể phát triển ý dưới dạng liệt kê, tuy có dấu hiệu cố gắng mở rộng ý nhưng các ý mở rộng thường chưa rõ ràng hoặc bị lặp.\n• Có thể liên kết ý một cách khá đa dạng khi sử dụng các phương tiện kết nối đơn giản.",
        6: "• Có thể phát triển ý một cách tương đối dễ dàng, mở rộng ý bằng một số chi tiết và ví dụ minh họa phù hợp.\n• Có thể sử dụng các phương tiện kết nối phức tạp hơn nhưng chưa thể hiện được rõ ràng mối quan hệ giữa các ý.",
        7: "• Có thể phát triển ý một cách khá dễ dàng, mở rộng ý bằng những chi tiết và ví dụ minh họa phù hợp.\n• Có thể sử dụng nhiều loại phương tiện kết nối để thể hiện khá rõ ràng mối quan hệ giữa các ý.",
        8: "• Có thể phát triển ý một cách dễ dàng, mở rộng ý bằng những chi tiết và ví dụ minh họa phù hợp.\n• Có thể sử dụng nhiều loại phương tiện kết nối để thể hiện rõ ràng mối quan hệ giữa các ý.",
        9: "• Có thể dễ dàng phát triển ý một cách khá tường tận với các chi tiết và ví dụ minh họa phù hợp, và đưa ra kết luận phù hợp.\n• Có thể trình bày ý rõ ràng, mạch lạc với cấu trúc chặt chẽ, thể hiện khả năng sử dụng khá thành thạo các phương tiện kết nối và các hình thức tổ chức ý.",
        10: "• Có thể dễ dàng phát triển ý một cách tường tận với các chi tiết và ví dụ minh họa phù hợp, và đưa ra kết luận phù hợp.\n• Có thể trình bày ý rõ ràng, mạch lạc với cấu trúc chặt chẽ, thể hiện khả năng sử dụng thành thạo các phương tiện kết nối và các hình thức tổ chức ý."
      }
    }
  ]
};

export const VSTEP_OFFICIAL_MATRIX_EN = {
  title: "VSTEP SPEAKING ASSESSMENT RUBRIC – LEVELS 3-5 (PARTS 1, 2, 3)",
  source: "Ministry of Education and Training (Vietnam)",
  scores: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  criteria: [
    {
      id: "grammar",
      name: "Grammar & Accuracy",
      sub_criteria: ["Grammatical Range", "Accuracy & Control"],
      icon: "📜",
      color: "#f59e0b",
      descriptors: {
        0: "Candidate absent / No performance.",
        1: "Can only use a very limited range of memorized simple grammatical structures and basic phrase patterns.",
        2: "Uses simple structures with reasonable accuracy but shows systematic basic errors; communicative intent is partially conveyed.",
        3: "Uses familiar simple sentence forms with reasonable accuracy; though errors are frequent, basic meaning is conveyed clearly.",
        4: "Accurately produces common simple sentence forms in routine contexts; occasional errors do not obscure meaning.",
        5: "• Produces common simple sentences accurately in routine contexts with minor errors.\n• Attempts complex sentence forms with noticeable errors.",
        6: "Flexibly and accurately uses simple sentences and some complex structures; minor slips do not lead to misunderstanding.",
        7: "Flexibly and accurately handles simple and fairly diverse complex sentences; occasional non-systematic errors occur.",
        8: "Consistently uses simple and a wide variety of complex sentences accurately; can self-correct slips immediately.",
        9: "Uses a rich variety of complex sentence structures flexibly and accurately; errors are rare and hard to detect.",
        10: "Displays full, flexible, and virtually error-free control over a wide variety of advanced sentence structures."
      }
    },
    {
      id: "vocabulary",
      name: "Vocabulary & Resource",
      sub_criteria: ["Lexical Range", "Precision & Control"],
      icon: "📚",
      color: "#3b82f6",
      descriptors: {
        0: "Candidate absent / No performance.",
        1: "Only produces isolated words and basic phrases related to very familiar personal topics.",
        2: "• Uses simple words and phrases for very familiar topics.\n• Selects correct word forms within this basic scope.",
        3: "Possesses sufficient vocabulary for familiar topics, although word repetition is frequent.",
        4: "• Uses vocabulary for familiar topics with occasional repetition.\n• Attempts less familiar topics but makes frequent lexical choice errors.",
        5: "• Uses vocabulary for familiar topics with occasional repetition.\n• Attempts unfamiliar topics with only minor lexical errors.",
        6: "• Sufficient vocabulary for most familiar topics; actively avoids repetition when attempting unfamiliar topics.\n• Fairly high lexical accuracy though some word choice errors persist.",
        7: "• Wide range of vocabulary on familiar topics; makes conscious efforts to avoid repetition on unfamiliar subjects.\n• High precision with occasional hesitation or minor inappropriate word choices.",
        8: "• Broad lexical repertoire across both familiar and unfamiliar topics.\n• Uses less common expressions and idiomatic phrases with good control.\n• High precision with only occasional minor slips.",
        9: "• Extensive vocabulary including uncommon words, idiomatic expressions, and colloquialisms.\n• Skillfully paraphrases and circumlocutes with minor hesitation.\n• Rare slips in lexical choice.",
        10: "• Extensive and sophisticated lexical resource including idiomatic expressions and nuance.\n• Paraphrases effortlessly and naturally without hesitation.\n• Free of lexical errors."
      }
    },
    {
      id: "pronunciation",
      name: "Pronunciation & Intonation",
      sub_criteria: ["Individual Sounds", "Stress", "Intonation"],
      icon: "🎙️",
      color: "#8b5cf6",
      descriptors: {
        0: "Candidate absent / No performance.",
        1: "Produces very simple words with low phonological accuracy, causing frequent listener strain.",
        2: "Relatively intelligible on simple words, but listener frequently needs repetition due to unclear delivery.",
        3: "Intelligible delivery on familiar words, but exhibits noticeable errors in individual sounds and word stress.",
        4: "• Intelligible delivery on words and phrases with occasional individual sound errors.\n• Attempts word stress though errors are frequent.",
        5: "• Intelligible and clear delivery; minor sound errors.\n• Attempts word stress with emerging accuracy.",
        6: "• Clear, natural, and easily intelligible pronunciation.\n• Individual sounds are mostly accurate.\n• Word stress is mostly correct; attempts sentence rhythm and intonation.",
        7: "• Clear, natural, and easily intelligible pronunciation.\n• Individual sounds are clear and accurate.\n• Word stress and sentence stress are accurate with good intonation efforts.",
        8: "• Clear, natural, and expressive pronunciation.\n• Accurate individual sounds and clear sentence stress.\n• Strong, effective command of expressive sentence intonation.",
        9: "• Accurate pronunciation, word stress, and sentence stress throughout.\n• Natural, appropriate intonation that conveys subtle shades of meaning.",
        10: "• Flawless phonological control, natural rhythm, and flexible intonation used effectively for communicative and stylistic nuance."
      }
    },
    {
      id: "fluency",
      name: "Fluency & Coherence",
      sub_criteria: ["Hesitation", "Speech Continuity"],
      icon: "⚡",
      color: "#10b981",
      descriptors: {
        0: "Candidate absent / No performance.",
        1: "Speaks with fragmented, halting delivery of very short memorized phrases.",
        2: "Speaks very slowly in short phrases; frequently stumbles and repeats words.",
        3: "Can express simple ideas fairly smoothly; almost unable to handle complex thoughts.",
        4: "• Smooth delivery on simple ideas; attempts complex thoughts slowly due to searching for words/grammar.\n• Uses simple phrases to sustain turns.",
        5: "• Smooth on simple ideas; manages complex ideas with noticeable search pauses.\n• Can produce extended turns though self-correction is present.",
        6: "• Communicates smoothly on both simple and complex ideas; search pauses are not prolonged.\n• Maintains longer turns with occasional non-systematic slips.",
        7: "• Communicates easily and steadily on simple and complex ideas; minimal search hesitation.\n• Produces long stretches of speech with minor repetition or self-correction.",
        8: "• Speaks fluently and effortlessly on most topics; pauses are content-related rather than language-searching.\n• Extended turns are sustained with rare minor slips.",
        9: "• Consistently maintains long, natural, and fluent stretches of speech; rare repetition.\n• Virtually no language hesitation; pauses are strictly conceptual.",
        10: "• Speaks completely fluently and naturally at a native-like tempo; no language-related pauses or hesitation."
      }
    },
    {
      id: "topic_development",
      name: "Topic Development",
      sub_criteria: ["Idea Development", "Cohesion & Structure"],
      icon: "🎯",
      color: "#06b6d4",
      descriptors: {
        0: "Candidate absent / No performance.",
        1: "• Barely expresses or develops ideas.\n• Only links words with basic connectors like 'and' or 'then'.",
        2: "• Addresses prompts but fails to develop beyond given keywords.\n• Uses basic connectors such as 'and', 'but', 'because'.",
        3: "• Answers prompts appropriately with simple listing of points.\n• Connects ideas using simple, repetitive cohesive devices.",
        4: "• Answers prompts appropriately with attempts to expand beyond mere listing.\n• Uses simple connectors with occasional repetition.",
        5: "• Develops points beyond simple listing; elaboration can be unclear or slightly repetitive.\n• Uses a fairly varied range of simple cohesive devices.",
        6: "• Develops topics relatively easily, supporting ideas with relevant details and examples.\n• Uses more complex connectors though relationships are not always fully distinct.",
        7: "• Develops topics clearly and easily with appropriate supporting examples.\n• Employs a variety of cohesive devices to clearly show relationships between ideas.",
        8: "• Fully develops topics with rich, relevant details and examples.\n• Uses a wide range of cohesive devices to clearly and logically link ideas.",
        9: "• Thoroughly and persuasively elaborates ideas with examples and suitable conclusions.\n• Clear, well-structured organization demonstrating skillful use of cohesive devices.",
        10: "• Sophisticated topic development with in-depth analysis, compelling examples, and logical conclusions.\n• Flawless discourse management and seamless transitions throughout."
      }
    }
  ]
};

// Default export is Vietnamese
export const VSTEP_OFFICIAL_MATRIX = VSTEP_OFFICIAL_MATRIX_VI;

/**
 * Hàm quy đổi điểm số VSTEP (0 - 10) sang Khung Năng Lực Bậc 3-5 (B1, B2, C1)
 * Chuẩn khảo thí theo Quy định của Bộ Giáo dục & Đào tạo Việt Nam
 */
export function getVstepBandLevel(score, lang = 'vi') {
  if (score === null || score === undefined || score === '' || isNaN(score)) {
    return null;
  }
  const num = parseFloat(score);
  const isEn = lang === 'en';

  if (num >= 8.5) {
    return {
      band: 'C1',
      levelNumber: 5,
      levelLabel: isEn ? 'Level 5 (C1)' : 'Bậc 5 (C1)',
      name: isEn ? 'Level 5 / CEFR C1 (Proficient)' : 'Bậc 5 / C1 (Thông thạo)',
      short: 'Bậc 5 (C1)',
      scoreRange: '8.5 - 10.0',
      desc: isEn ? 'Advanced operational proficiency' : 'Năng lực thông thạo / Cao cấp',
      status: isEn ? 'Passed C1' : 'Đạt chuẩn Bậc 5 (C1)',
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.15)',
      badgeClass: 'badge-c1'
    };
  }
  if (num >= 6.0) {
    return {
      band: 'B2',
      levelNumber: 4,
      levelLabel: isEn ? 'Level 4 (B2)' : 'Bậc 4 (B2)',
      name: isEn ? 'Level 4 / CEFR B2 (Independent)' : 'Bậc 4 / B2 (Độc lập)',
      short: 'Bậc 4 (B2)',
      scoreRange: '6.0 - 8.0',
      desc: isEn ? 'Independent operational proficiency' : 'Năng lực độc lập / Khá',
      status: isEn ? 'Passed B2' : 'Đạt chuẩn Bậc 4 (B2)',
      color: '#6366f1',
      bg: 'rgba(99, 102, 241, 0.15)',
      badgeClass: 'badge-b2'
    };
  }
  if (num >= 4.0) {
    return {
      band: 'B1',
      levelNumber: 3,
      levelLabel: isEn ? 'Level 3 (B1)' : 'Bậc 3 (B1)',
      name: isEn ? 'Level 3 / CEFR B1 (Threshold)' : 'Bậc 3 / B1 (Ngưỡng)',
      short: 'Bậc 3 (B1)',
      scoreRange: '4.0 - 5.5',
      desc: isEn ? 'Threshold conversational proficiency' : 'Năng lực ngưỡng / Đạt chuẩn B1',
      status: isEn ? 'Passed B1' : 'Đạt chuẩn Bậc 3 (B1)',
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.15)',
      badgeClass: 'badge-b1'
    };
  }
  return {
    band: 'Dưới B1',
    levelNumber: 2,
    levelLabel: isEn ? 'Below B1 (A1 - A2)' : 'Dưới B1 (A1 - A2)',
    name: isEn ? 'Below B1 (A1 - A2 / Not Certified)' : 'Dưới B1 (A1 - A2 / Chưa đạt)',
    short: 'Dưới B1',
    scoreRange: '0.0 - 3.5',
    desc: isEn ? 'Elementary communication / Not certified' : 'Sơ cấp / Chưa đạt chuẩn B1',
    status: isEn ? 'Not Certified' : 'Không cấp chứng chỉ (Dưới B1)',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.15)',
    badgeClass: 'badge-sub-b1'
  };
}
