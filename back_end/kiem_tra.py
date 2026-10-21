import os
import sys
import urllib.request
import json
import subprocess
from dotenv import load_dotenv

# Đảm bảo in tiếng Việt trên console Windows không bị lỗi bảng mã
if sys.platform == "win32":
    try:
        if hasattr(sys.stdout, "reconfigure"):
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

load_dotenv()

print("\n=== KẾT QUẢ KIỂM TRA HỆ THỐNG VSTEP AI ===")

# 1. Kiểm tra kết nối LM Studio
lm_base_url = os.getenv("LM_STUDIO_BASE_URL", "http://127.0.0.1:1234/v1").rstrip("/")
expected_model = os.getenv("QWEN_MODEL", "qwen2.5-14b-instruct-1m")

try:
    models_url = f"{lm_base_url}/models"
    req = urllib.request.Request(models_url, headers={"User-Agent": "VSTEP-Pro/1.0"})
    with urllib.request.urlopen(req, timeout=5) as response:
        if response.status == 200:
            data = json.loads(response.read().decode("utf-8"))
            loaded_models = [m.get("id", "") for m in data.get("data", [])]
            print(f"1. Máy chủ AI (LM Studio): ĐÃ KẾT NỐI THÀNH CÔNG tại {lm_base_url}")
            if expected_model in loaded_models:
                print(f"   -> Model mục tiêu: ĐÃ TÌM THẤY ({expected_model})")
            else:
                current_model = loaded_models[0] if loaded_models else "Chưa rõ"
                print(f"   -> Model đang nạp: {current_model} (sẽ tự động dùng model này)")
        else:
            print(f"1. Máy chủ AI (LM Studio): CẢNH BÁO! Server phản hồi mã HTTP {response.status}")
except Exception as e:
    print("1. Máy chủ AI (LM Studio): CHƯA BẬT HOẶC CHƯA BẤM 'START SERVER'!")
    print(f"   -> Vui lòng mở LM Studio, chọn model và bấm 'Start Server' tại {lm_base_url}")

# 2. Kiểm tra FFmpeg (bắt buộc để xử lý âm thanh)
try:
    subprocess.run(["ffmpeg", "-version"], capture_output=True, check=True)
    print("2. Công cụ âm thanh (FFmpeg): ĐÃ HOẠT ĐỘNG TỐT")
except Exception:
    print("2. Công cụ âm thanh (FFmpeg): LỖI! Chưa nhận diện được FFmpeg trong hệ thống.")

# 3. Kiểm tra Whisper cấu hình trong .env
whisper_model = os.getenv("WHISPER_MODEL", "large-v3")
print(f"3. Cấu hình mô hình nhận dạng giọng nói (Whisper): {whisper_model}")

print("==========================================\n")