# jobradar/setup_and_run.py

#!/usr/bin/env python3
"""
Simple setup and run script for JobRadar
"""

import subprocess
import sys
import os
from pathlib import Path

def main():
    backend_path = Path(__file__).parent / "backend"
    
    # Create virtual environment
    print("📦 Creating virtual environment...")
    subprocess.run([sys.executable, "-m", "venv", str(backend_path / "venv")], check=True)
    
    # Get pip path
    if os.name == 'nt':  # Windows
        pip_path = backend_path / "venv" / "Scripts" / "pip.exe"
        python_path = backend_path / "venv" / "Scripts" / "python.exe"
    else:  # Linux/Mac
        pip_path = backend_path / "venv" / "bin" / "pip"
        python_path = backend_path / "venv" / "bin" / "python"
    
    # Install requirements
    print("📦 Installing dependencies...")
    subprocess.run([str(pip_path), "install", "-r", str(backend_path / "requirements.txt")], check=True)
    
    # Install Playwright browsers
    print("🌐 Installing Playwright browsers...")
    subprocess.run([str(python_path), "-m", "playwright", "install"], check=True)
    
    # Download NLTK data
    print("🧠 Downloading NLTK data...")
    nltk_script = "import nltk; nltk.download('punkt'); nltk.download('stopwords'); nltk.download('wordnet')"
    subprocess.run([str(python_path), "-c", nltk_script], check=True)
    
    # Run the server
    print("🚀 Starting FastAPI server...")
    os.chdir(backend_path)
    subprocess.run([str(python_path), "-m", "app.main"])

if __name__ == "__main__":
    main()