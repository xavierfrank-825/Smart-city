@echo off
echo Starting Django Backend Server...
echo.
cd /d "%~dp0"

REM Check if virtual environment exists and activate it
if exist "venv\Scripts\activate.bat" (
    echo Activating virtual environment...
    call venv\Scripts\activate.bat
) else (
    echo No virtual environment found, using system Python...
)

echo.
echo Installing/checking dependencies...
python -m pip install -q djangorestframework django-cors-headers whitenoise

echo.
echo Starting server...
python manage.py runserver
pause

