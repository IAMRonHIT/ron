#!/bin/bash
cd /Users/timhunter/ron-ai/backend

# Kill any existing Python process on port 8000
lsof -ti:8000 | xargs kill -9 2>/dev/null || true

# Start the backend
echo "Starting backend API server..."
python api.py