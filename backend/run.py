#!/usr/bin/env python3
"""
JobRadar Backend - FastAPI Application Runner
This script handles environment setup, dependency installation, and server startup.
"""

import os
import sys
import subprocess
import time
import platform
from pathlib import Path

# Colors for terminal output
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    END = '\033[0m'
    BOLD = '\033[1m'


def print_banner():
    """Print application banner"""
    banner = f"""
{Colors.BLUE}{Colors.BOLD}
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║     ██╗  ██████╗ ██████╗ ██████╗  █████╗ ██████╗           ║
║     ██║ ██╔═══██╗██╔══██╗██╔══██╗██╔══██╗██╔══██╗          ║
║     ██║ ██║   ██║██████╔╝██║  ██║███████║██████╔╝          ║
║     ██║ ██║   ██║██╔══██╗██║  ██║██╔══██║██╔══██╗          ║
║     ██║ ╚██████╔╝██████╔╝██████╔╝██║  ██║██║  ██║          ║
║     ╚═╝  ╚═════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝          ║
║                                                            ║
║              BACKEND - FastAPI Service                      ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
{Colors.END}
    """
    print(banner)


def print_step(message, emoji="📦"):
    print(f"\n{Colors.BLUE}▶ {emoji} {message}{Colors.END}")


def print_success(message):
    print(f"{Colors.GREEN}✅ {message}{Colors.END}")


def print_error(message):
    print(f"{Colors.RED}❌ {message}{Colors.END}")


def print_info(message):
    print(f"{Colors.YELLOW}ℹ️  {message}{Colors.END}")


def get_backend_path():
    """Get the backend directory path (where this script is located)"""
    return Path(__file__).parent.absolute()


def create_venv_if_missing(backend_path):
    """Create virtual environment if it doesn't exist"""
    venv_path = backend_path / "venv"
    
    if not venv_path.exists():
        print_step("Creating virtual environment...", "🔧")
        
        try:
            subprocess.run(
                [sys.executable, "-m", "venv", str(venv_path)],
                check=True,
                capture_output=True,
                text=True
            )
            print_success("Virtual environment created")
            return True
        except subprocess.CalledProcessError as e:
            print_error(f"Failed to create virtual environment: {e.stderr}")
            return False
    else:
        print_info("Virtual environment already exists")
        return True


def get_venv_python(backend_path):
    """Get the path to the virtual environment Python executable"""
    if platform.system() == "Windows":
        return backend_path / "venv" / "Scripts" / "python.exe"
    else:
        return backend_path / "venv" / "bin" / "python"


def get_venv_pip(backend_path):
    """Get the path to the virtual environment pip executable"""
    if platform.system() == "Windows":
        return backend_path / "venv" / "Scripts" / "pip.exe"
    else:
        return backend_path / "venv" / "bin" / "pip"


def install_requirements(backend_path):
    """Install requirements using pip"""
    print_step("Installing dependencies...", "📦")
    
    pip_path = get_venv_pip(backend_path)
    requirements_path = backend_path / "requirements.txt"
    
    if not requirements_path.exists():
        print_error(f"requirements.txt not found at {requirements_path}")
        return False
    
    try:
        subprocess.run(
            [str(pip_path), "install", "--upgrade", "pip"],
            check=True,
            capture_output=True,
            text=True
        )
        
        subprocess.run(
            [str(pip_path), "install", "-r", str(requirements_path)],
            check=True,
            capture_output=True,
            text=True
        )
        print_success("Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print_error(f"Failed to install dependencies: {e.stderr}")
        return False


def install_playwright_browsers(backend_path):
    """Install Playwright browsers"""
    print_step("Installing Playwright browsers...", "🌐")
    
    python_path = get_venv_python(backend_path)
    
    try:
        subprocess.run(
            [str(python_path), "-m", "playwright", "install"],
            check=True,
            capture_output=True,
            text=True
        )
        print_success("Playwright browsers installed")
        return True
    except subprocess.CalledProcessError as e:
        print_error(f"Failed to install Playwright browsers: {e.stderr}")
        return False


def download_nltk_data(backend_path):
    """Download NLTK data"""
    print_step("Downloading NLTK data...", "🧠")
    
    python_path = get_venv_python(backend_path)
    
    nltk_script = """
import nltk
nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)
nltk.download('wordnet', quiet=True)
nltk.download('omw-1.4', quiet=True)
print('NLTK data downloaded successfully')
"""
    
    try:
        subprocess.run(
            [str(python_path), "-c", nltk_script],
            check=True,
            capture_output=True,
            text=True
        )
        print_success("NLTK data downloaded")
        return True
    except subprocess.CalledProcessError as e:
        print_error(f"Failed to download NLTK data: {e.stderr}")
        return False


def check_env_file(backend_path):
    """Check if .env file exists, create from example if not"""
    env_path = backend_path / ".env"
    env_example_path = backend_path / ".env.example"
    
    if not env_path.exists():
        if env_example_path.exists():
            print_step("Creating .env file from example...", "📝")
            try:
                with open(env_example_path, 'r') as src:
                    with open(env_path, 'w') as dst:
                        dst.write(src.read())
                print_success(".env file created from example")
                print_info("Please review and update the .env file with your API keys")
            except Exception as e:
                print_error(f"Failed to create .env file: {e}")
                return False
        else:
            print_info("No .env.example file found")
            return False
    else:
        print_info(".env file already exists")
    
    return True


def check_ports():
    """Check if port 8000 is available"""
    import socket
    
    port = 8000
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        sock.bind(('127.0.0.1', port))
        sock.close()
        return True
    except socket.error:
        print_error(f"Port {port} is already in use")
        return False


def run_backend(backend_path, debug=True):
    """Run the FastAPI backend server"""
    print_step(f"Starting FastAPI server on http://localhost:8000", "🚀")
    
    python_path = get_venv_python(backend_path)
    
    # Change to backend directory
    os.chdir(backend_path)
    
    # Set environment
    env = os.environ.copy()
    env["PYTHONPATH"] = str(backend_path)
    env["DEBUG"] = "True" if debug else "False"
    
    try:
        subprocess.run(
            [str(python_path), "-m", "app.main"],
            env=env
        )
    except KeyboardInterrupt:
        print_info("\nServer stopped by user")
    except Exception as e:
        print_error(f"Failed to run server: {e}")


def main():
    """Main execution function"""
    print_banner()
    
    # Get backend path
    backend_path = get_backend_path()
    
    print_info(f"Backend path: {backend_path}")
    
    # Step 1: Check .env file
    print_step("Checking environment configuration...", "🔐")
    if not check_env_file(backend_path):
        print_error("Environment setup failed")
        sys.exit(1)
    
    # Step 2: Create virtual environment
    if not create_venv_if_missing(backend_path):
        print_error("Virtual environment setup failed")
        sys.exit(1)
    
    # Step 3: Install dependencies
    if not install_requirements(backend_path):
        print_error("Dependency installation failed")
        sys.exit(1)
    
    # Step 4: Install Playwright browsers
    if not install_playwright_browsers(backend_path):
        print_info("Playwright browser installation failed - continuing anyway")
    
    # Step 5: Download NLTK data
    if not download_nltk_data(backend_path):
        print_info("NLTK data download failed - continuing anyway")
    
    # Step 6: Check ports
    print_step("Checking available ports...", "🔌")
    if not check_ports():
        print_error("Port 8000 is not available")
        print_info("Please free up port 8000 for the backend server")
        sys.exit(1)
    
    # Step 7: Run the server
    print_success("All setup complete! Starting server...")
    print_info("Press Ctrl+C to stop the server")
    print_info("API documentation will be available at http://localhost:8000/docs")
    print("")
    
    run_backend(backend_path, debug=True)


if __name__ == "__main__":
    main()