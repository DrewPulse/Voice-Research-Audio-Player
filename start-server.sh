#!/bin/bash

# Voice Research Audio Player - Development Server Startup Script

echo "Starting Voice Research Audio Player..."
echo "This will start the development server on http://localhost:3000"
echo ""

# Kill any existing server
if [ -f server.pid ]; then
    echo "Stopping existing server..."
    kill $(cat server.pid) 2>/dev/null || true
    rm server.pid
fi

# Start the server
nohup npm run dev > server.log 2>&1 & 
echo $! > server.pid

# Wait a moment for server to start
sleep 3

# Check if server is running
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Server is running successfully!"
    echo "🌐 Open http://localhost:3000 in your browser"
    echo "📋 Server PID: $(cat server.pid)"
    echo "📁 Logs: tail -f server.log"
    echo ""
    echo "To stop the server, run: ./stop-server.sh"
else
    echo "❌ Server failed to start"
    echo "Check logs: cat server.log"
fi