@echo off
echo ======================================================
echo  JobRadar - FastAPI Application Runner
echo ======================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python 3.9+ and try again
    pause
    exit /b 1
)

REM Check if we're in the right directory (should be in backend/)
if not exist "app\main.py" (
    echo [ERROR] Cannot find app\main.py
    echo Please run this script from the jobradar\backend directory
    echo Current directory: %CD%
    pause
    exit /b 1
)

REM Run the Python script
echo Starting JobRadar Backend...
echo.
python run.py

pause