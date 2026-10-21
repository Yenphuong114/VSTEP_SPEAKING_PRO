import os
import re
from dotenv import load_dotenv

load_dotenv()

ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'vstep_admin_2025')
TEACHER_PASSWORD = os.getenv('TEACHER_PASSWORD', 'vstep_teacher_2025')


def verify_password(password: str) -> dict | None:
    if not password:
        return None
    # Đọc lại từ file .env để khi người dùng sửa .env sẽ có hiệu lực ngay lập tức
    load_dotenv(override=True)
    admin_pw = os.getenv('ADMIN_PASSWORD', 'vstep_admin_2025')
    teacher_pw = os.getenv('TEACHER_PASSWORD', 'vstep_teacher_2025')

    if password == admin_pw:
        return {'role': 'admin'}
    if password == teacher_pw:
        return {'role': 'teacher'}
    return None


def parse_score_from_filename(filename: str) -> int | None:
    if not filename:
        return None
    match = re.search(r'_grade_(\d+)', filename, re.IGNORECASE)
    if match:
        score = int(match.group(1))
        if 0 <= score <= 10:
            return score
    return None
