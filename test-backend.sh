#!/bin/bash

echo "🧪 Testing Chat App Backend..."

# Test if backend is running
curl -s http://localhost:3000/api/users > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Backend is running on http://localhost:3000"
else
    echo "❌ Backend is not running on http://localhost:3000"
    echo "Please start the backend first: cd back && npm start"
    exit 1
fi

# Test CORS headers
echo "🔍 Checking CORS headers..."
curl -s -I -H "Origin: http://localhost:3001" http://localhost:3000/api/users | grep -i "access-control"
curl -s -I -H "Origin: http://localhost:3002" http://localhost:3000/api/users | grep -i "access-control"

echo ""
echo "✅ Backend test complete!"