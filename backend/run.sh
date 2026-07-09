#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================================${NC}"
echo -e "${BLUE} JobRadar - FastAPI Application Runner${NC}"
echo -e "${BLUE}=====================================================${NC}"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}[ERROR] Python 3 is not installed or not in PATH${NC}"
    echo "Please install Python 3.9+ and try again"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "backend/app/main.py" ]; then
    echo -e "${RED}[ERROR] Cannot find backend/app/main.py${NC}"
    echo "Please run this script from the jobradar root directory"
    exit 1
fi

# Make run.py executable
chmod +x run.py

# Run the Python script
echo -e "${GREEN}Starting JobRadar...${NC}"
echo ""
python3 run.py