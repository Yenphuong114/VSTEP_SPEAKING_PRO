import os
import sys
import shutil
import tempfile
import uuid
import time
import traceback

# Đảm bảo thư mục back_end luôn nằm trong sys.path khi chạy từ bất cứ đâu
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

# Thiết lập mã hóa UTF-8 cho console Windows tránh UnicodeEncodeError với tiếng Việt
if sys.platform == "win32":
    try:
        if hasattr(sys.stdout, "reconfigure"):
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        if hasattr(sys.stderr, "reconfigure"):
            sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

from typing import Optional
import json
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Body, Header
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

load_dotenv()

from stt_service import process_audio
from evaluator import evaluate_vstep
import rubric_service
import auth_service

app = FastAPI(title="VSTEP Speaking Assessment API")

# Cho phép Frontend gọi API (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Chống lưu cache trên trình duyệt để luôn hiển thị mã mới nhất
@app.middleware("http")
async def add_no_cache_headers(request, call_next):
    response = await call_next(request)
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response

TEMP_DIR = os.path.join(tempfile.gettempdir(), "vstep_speaking_pro")
os.makedirs(TEMP_DIR, exist_ok=True)
ERROR_LOG_PATH = os.path.join(BASE_DIR, "error_log.txt")

# Chuyển sang hàm đồng bộ (def thay vì async def) để FastAPI tự động chạy trong threadpool worker,
# tránh làm nghẽn event loop chính khi Whisper STT và LLM đang xử lý nặng.
@app.post("/api/evaluate")
def evaluate_speech(
    audio: UploadFile = File(...),
    topic: str = Form(...),
    part: str = Form(...)
):
    temp_file_path = None
    try:
        # Lấy đuôi mở rộng an toàn (tránh lỗi nếu audio.filename là None)
        ext = os.path.splitext(audio.filename or "")[1] or ".wav"
        unique_filename = f"{uuid.uuid4().hex}{ext}"
        temp_file_path = os.path.join(TEMP_DIR, unique_filename)
        
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)
            
        # 1. Chuyển đổi giọng nói và phân tích WPM bằng Whisper
        audio_analysis = process_audio(temp_file_path)
        
        # 2. Đánh giá VSTEP qua AI (Gemini hoặc LM Studio)
        result = evaluate_vstep(
            topic=topic,
            part=part,
            transcript=audio_analysis["text"],
            wpm=audio_analysis["wpm"],
            duration=audio_analysis["duration"],
            speech_duration=audio_analysis.get("speech_duration", audio_analysis["duration"]),
            pause_count=audio_analysis.get("pause_count", 0),
            long_pause_count=audio_analysis.get("long_pause_count", 0),
            speech_ratio=audio_analysis.get("speech_ratio", 1.0),
            avg_pause_duration=audio_analysis.get("avg_pause_duration", 0.0),
        )
        
        result["user_transcript"] = audio_analysis["text"]
        result["wpm"] = audio_analysis["wpm"]
        
        return result

    except HTTPException:
        raise
    except Exception as e:
        error_msg = traceback.format_exc()
        print(f"\n[ERROR] Lỗi khi xử lý bài thi nói:\n{error_msg}")
        
        # Ghi log lỗi có timestamp vào file error_log.txt trong thư mục back_end
        try:
            current_time = time.strftime('%Y-%m-%d %H:%M:%S')
            with open(ERROR_LOG_PATH, "a", encoding="utf-8") as f:
                f.write(f"\n--- ERROR [{current_time}] ---\n{error_msg}\n")
        except Exception:
            pass
            
        err_str = str(e)
        if "429_RATE_LIMIT" in err_str:
            raise HTTPException(
                status_code=429, 
                detail="Google Gemini Rate Limit Exceeded (Hết hạn mức yêu cầu tạm thời, vui lòng đợi hoặc chuyển sang LM Studio)."
            )
        
        if "Không thể kết nối" in err_str or "Connection error" in err_str:
            raise HTTPException(
                status_code=503,
                detail=err_str
            )
            
        raise HTTPException(status_code=500, detail=err_str)

    finally:
        # Giải phóng stream của audio file upload
        try:
            audio.file.close()
        except Exception:
            pass

        # Đảm bảo luôn xóa file tạm trên đĩa sau khi xử lý xong (kể cả khi gặp lỗi)
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except Exception:
                pass


# ==============================================================================
# XÁC THỰC GIÁO VIÊN (AUTH)
# ==============================================================================

@app.post("/api/auth")
def login_endpoint(data: dict = Body(...)):
    """Xác thực mật khẩu giáo viên/admin, trả về vai trò nếu đúng."""
    password = data.get("password", "")
    result = auth_service.verify_password(password)
    if result is None:
        raise HTTPException(status_code=401, detail="Mật khẩu không đúng. Vui lòng thử lại.")
    return result  # {"role": "admin"} hoặc {"role": "teacher"}


@app.get("/api/parse-grade")
def parse_grade_endpoint(filename: str = ""):
    """Trích xuất điểm giáo viên từ tên file theo pattern _grade_N."""
    score = auth_service.parse_score_from_filename(filename)
    if score is None:
        return {"score": None, "found": False}
    return {"score": score, "found": True}


# ==============================================================================
# CÁC ENDPOINT QUẢN LÝ RUBRIC CHẤM ĐIỂM (VSTEP RUBRIC REST API)
# ==============================================================================

@app.get("/api/rubric")
def get_rubric_endpoint():
    """Lấy cấu hình Rubric đang hoạt động."""
    try:
        return rubric_service.get_active_rubric()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/rubric")
def update_rubric_endpoint(
    data: dict = Body(...),
    x_user_role: Optional[str] = Header(None, alias="X-User-Role")
):
    """Cập nhật cấu hình Rubric (Bảo mật: Chỉ Quản trị viên - Admin mới có quyền thực hiện)."""
    user_role = x_user_role or data.get("user_role") or data.get("role")
    if user_role != "admin":
        print(f"[RUBRIC 403] Từ chối truy cập: role='{user_role}' không có quyền sửa Rubric.")
        raise HTTPException(
            status_code=403,
            detail="Quyền bị từ chối: Chỉ Quản trị viên (Admin) mới có quyền chỉnh sửa và lưu cấu hình Barem/Rubric. Giáo viên chỉ có quyền tra cứu."
        )

    # Loại bỏ metadata role trước khi lưu vào rubric_config.json
    clean_data = {k: v for k, v in data.items() if k not in ("user_role", "role")}
    try:
        saved = rubric_service.save_rubric(clean_data)
        print("[RUBRIC] Lưu cấu hình Rubric thành công bởi Admin.")
        return {
            "status": "success", 
            "message": "Đã cập nhật Rubric chấm điểm thành công!", 
            "rubric": saved
        }
    except ValueError as ve:
        print(f"[RUBRIC 400] Yêu cầu không hợp lệ: {ve}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        print(f"[RUBRIC 500] Lỗi hệ thống khi lưu: {e}")
        raise HTTPException(status_code=500, detail=f"Lỗi khi lưu Rubric: {str(e)}")


@app.get("/api/rubric/presets")
def get_rubric_presets_endpoint():
    """Lấy danh sách các bộ mẫu Rubric chuẩn (English & Vietnamese)."""
    try:
        return rubric_service.get_rubric_presets()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/rubric/reset")
def reset_rubric_endpoint(lang: str = "en"):
    """Khôi phục Rubric về mặc định (hỗ trợ lang=en hoặc lang=vi)."""
    try:
        reset_data = rubric_service.reset_rubric(lang=lang)
        return {
            "status": "success", 
            "message": "Đã khôi phục Rubric về chuẩn mặc định thành công!", 
            "rubric": reset_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi khôi phục Rubric: {str(e)}")


@app.get("/api/rubric/export")
def export_rubric_endpoint():
    """Tải cấu hình Rubric về dưới dạng file JSON."""
    try:
        rubric = rubric_service.get_active_rubric()
        return JSONResponse(
            content=rubric,
            headers={"Content-Disposition": "attachment; filename=vstep_rubric.json"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/rubric/import")
def import_rubric_endpoint(file: UploadFile = File(...)):
    """Nhập cấu hình Rubric từ file JSON tải lên."""
    try:
        content = file.file.read().decode("utf-8")
        parsed = json.loads(content)
        saved = rubric_service.save_rubric(parsed)
        return {
            "status": "success", 
            "message": "Đã nhập Rubric từ file thành công!", 
            "rubric": saved
        }
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="File tải lên không phải định dạng JSON hợp lệ.")
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi nhập file Rubric: {str(e)}")
    finally:
        try:
            file.file.close()
        except Exception:
            pass


# Phục vụ trực tiếp giao diện Frontend React tại http://localhost:8000 (Luôn tắt cache để cập nhật tức thì)
REACT_DIST_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "vstep_web_react", "dist"))

class NoCacheStaticFiles(StaticFiles):
    def is_not_modified(self, response_headers, request_headers) -> bool:
        return False

    def file_response(self, *args, **kwargs):
        resp = super().file_response(*args, **kwargs)
        resp.headers["Cache-Control"] = "no-cache, no-store, must-revalidate, max-age=0"
        resp.headers["Pragma"] = "no-cache"
        resp.headers["Expires"] = "0"
        return resp

if os.path.exists(REACT_DIST_DIR):
    print(f"[FRONTEND] Đang phục vụ giao diện React mới tại: {REACT_DIST_DIR}")
    app.mount("/", NoCacheStaticFiles(directory=REACT_DIST_DIR, html=True), name="react_frontend")
else:
    print(f"[FRONTEND ERROR] Chưa tìm thấy bản build React tại: {REACT_DIST_DIR}")

if __name__ == "__main__":
    import uvicorn
    server_port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=server_port, 
        reload=True, 
        app_dir=BASE_DIR,
        reload_excludes=["*.txt", "*.log", "error_log.txt"]
    )