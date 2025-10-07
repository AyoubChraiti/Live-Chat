#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Live Chat App${NC}"
echo -e "${YELLOW}📡 Backend will run on http://localhost:3000${NC}"
echo -e "${YELLOW}🌐 Frontend will run on http://localhost:3001${NC}"
echo -e "${RED}⚠️  If frontend runs on different port, update backend CORS settings${NC}"
echo ""

# Check if backend dependencies are installed
if [ ! -d "back/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
    cd back && npm install && cd ..
fi

# Check if frontend dependencies are installed
if [ ! -d "front/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
    cd front && npm install && cd ..
fi

echo -e "${GREEN}🔥 Starting servers...${NC}"
echo ""

# Start backend in background
cd /Users/xraiti/Desktop/Chat/back && npm start &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend
cd /Users/xraiti/Desktop/Chat/front && npm run dev

# When frontend exits, kill backend
kill $BACKEND_PID