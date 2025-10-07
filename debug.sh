#!/bin/bash

echo "🔧 Chat App Debug Helper"
echo "========================"

echo ""
echo "📊 Port Status:"
echo "Port 3000 (Backend):"
lsof -ti:3000 && echo "✅ Port 3000 is in use" || echo "❌ Port 3000 is free"

echo "Port 3001 (Frontend):"
lsof -ti:3001 && echo "✅ Port 3001 is in use" || echo "❌ Port 3001 is free"

echo "Port 3002 (Frontend backup):"
lsof -ti:3002 && echo "✅ Port 3002 is in use" || echo "❌ Port 3002 is free"

echo ""
echo "🚀 Quick Fix Commands:"
echo "1. Kill all processes:"
echo "   kill -9 \$(lsof -ti:3000,3001,3002) 2>/dev/null"
echo ""
echo "2. Start backend:"
echo "   cd back && npm start"
echo ""
echo "3. Start frontend (new terminal):"
echo "   cd front && npm run dev"
echo ""
echo "4. If frontend runs on different port, access that URL instead"
echo ""
echo "📍 Expected URLs:"
echo "   Backend API: http://localhost:3000"
echo "   Frontend: http://localhost:3001 (or whatever Vite shows)"