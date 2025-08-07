#!/bin/bash

# Voice Research Audio Player - Stop Development Server Script

echo "Stopping Voice Research Audio Player server..."

if [ -f server.pid ]; then
    PID=$(cat server.pid)
    kill $PID 2>/dev/null && echo "✅ Server stopped (PID: $PID)" || echo "⚠️ Server was not running or already stopped"
    rm server.pid
else
    echo "⚠️ No server PID file found. Server may not be running."
fi

# Also kill any node processes running vite
pkill -f "vite" 2>/dev/null && echo "✅ Cleaned up any remaining Vite processes"

echo "🏁 Shutdown complete"