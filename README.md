# VSTEP Speaking Pro 🎙️

Hệ thống luyện thi và chấm điểm nói tiếng Anh chuẩn định dạng **VSTEP (Vietnamese Standardized Test of English Proficiency)** ứng dụng Trí tuệ Nhân tạo (Whisper STT + LM Studio / Google Gemini).

---

## 🌟 Tính năng chính

- **Luyện thi 3 phần chuẩn VSTEP Speaking:**
  - Part 1: Social Interaction (Tương tác xã hội)
  - Part 2: Solution Discussion (Thảo luận giải pháp)
  - Part 3: Topic Development (Phát triển chủ đề)
- **Công nghệ AI tích hợp:**
  - **STT (Speech-to-Text):** Sử dụng OpenAI Whisper (`large-v3` / base) chuyển giọng nói thành văn bản chuẩn xác.
  - **Chấm điểm & Nhận xét:** Hỗ trợ mô hình cục bộ qua **LM Studio (Qwen 2.5 14B Instruct)** bảo mật và offline, hoặc **Google Gemini** qua Cloud API.
  - **Chấm theo Rubric chi tiết:** Phát âm, Ngữ pháp, Từ vựng, Độ trôi chảy & Phát triển ý.
- **Giao diện hiện đại (React + Vite):**
  - Giao diện trực quan, hỗ trợ ghi âm trực tiếp hoặc tải tệp âm thanh lên.
  - Phân quyền Admin / Teacher tùy chỉnh tiêu chí chấm và đề thi.
  - Chấm hàng loạt (Batch Processing) cho giáo viên.

---

## 📁 Cấu trúc thư mục

```text
VSTEP_Speaking_Pro/
├── back_end/                  # FastAPI Backend
│   ├── main.py                # Server FastAPI & API Endpoints
│   ├── evaluator.py           # Logic chấm điểm với LLM
│   ├── stt_service.py         # Nhận dạng giọng nói với Whisper
│   ├── rubric_service.py      # Quản lý tiêu chí rubric & đề bài
│   ├── auth_service.py        # Xác thực & phân quyền
│   ├── requirements.txt       # Danh sách thư viện Python
│   └── .env.example           # Cấu hình biến môi trường mẫu
├── vstep_web_react/           # Frontend React + Vite
│   ├── src/                   # Mã nguồn React UI & Components
│   └── package.json           # Danh sách dependencies npm
├── front_end_legacy_backup/   # Giao diện HTML/JS thuần (dự phòng)
├── Run_Backend.bat            # Script khởi chạy nhanh backend trên Windows
└── README.md
```

---

## 🚀 Hướng dẫn cài đặt & Khởi chạy

### 1. Backend (FastAPI)

1. Mở terminal và chuyển vào thư mục `back_end`:
   ```bash
   cd back_end
   ```
2. Tạo môi trường ảo và kích hoạt:
   ```bash
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   ```
3. Cài đặt các thư viện cần thiết:
   ```bash
   pip install -r requirements.txt
   ```
4. Thiết lập file cấu hình môi trường:
   - Sao chép `.env.example` thành `.env`:
     ```bash
     copy .env.example .env
     ```
   - Cập nhật thông số `LM_STUDIO_BASE_URL` hoặc `GEMINI_API_KEY` nếu muốn dùng Cloud.
5. Khởi chạy server:
   ```bash
   python -m uvicorn main:app --reload --port 8000
   ```
   *(Hoặc chạy trực tiếp file `Run_Backend.bat` trên Windows)*.

### 2. Frontend (React + Vite)

1. Mở terminal mới và chuyển vào thư mục `vstep_web_react`:
   ```bash
   cd vstep_web_react
   ```
2. Cài đặt dependencies:
   ```bash
   npm install
   ```
3. Khởi chạy giao diện phát triển:
   ```bash
   npm run dev
   ```
4. Mở trình duyệt tại địa chỉ (`http://localhost:8000/?v=2`).

---

## 📜 Giấy phép & Bản quyền (License & Copyright)

Dự án này là sản phẩm học tập và nghiên cứu khoa học thuộc bản quyền của tác giả.

- **Tác giả / Nhà phát triển:** Phạm Thùy Yến Phương ([@Yenphuong114](https://github.com/Yenphuong114))
- **Bản quyền:** © 2026 Pham Thuy Yen Phuong. All rights reserved.

### ⚠️ Điều khoản sử dụng:
1. **Mục đích học tập:** Bạn được phép xem và tham khảo mã nguồn cho mục đích học tập cá nhân và nghiên cứu phi thương mại.
2. **Cấm sao chép bản quyền:** Tuyệt đối **không được phép** sao chép, giả mạo, đổi tên tác giả hoặc tự nhận là sản phẩm của mình để nộp báo cáo, đồ án hoặc công bố nghiên cứu khoa học.
3. **Cấm thương mại hóa:** Nghiêm cấm phân phối lại, bán lại mã nguồn hoặc sử dụng bất kỳ phần nào của dự án cho mục đích thương mại dưới mọi hình thức khi chưa có sự đồng ý bằng văn bản từ tác giả.

> *For academic reference only. Unauthorized copying, modification, plagiarism, or commercial use is strictly prohibited without explicit written permission from the author.*

