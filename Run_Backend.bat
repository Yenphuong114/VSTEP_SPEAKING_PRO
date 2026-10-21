@echo off
color 0A
echo ===================================================
echo      DANG KHOI DONG HE THONG AI VSTEP...
echo ===================================================

:: Di chuyen vao thu muc back_end
cd /d "%~dp0back_end"

:: Kich hoat moi truong ao
call .\.venv\Scripts\activate.bat

:: Khoi chay server
echo Dang bat server o cong 8000. Vui long khong tat cua so nay!
python main.py

pause