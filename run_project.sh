#!/bin/bash

# Start the backend
echo "Starting backend server..."
cd backend
bash run.sh &
BACKEND_PID=$!

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 5

# Start the frontend
echo "Starting frontend server..."
cd ..
npm run dev

# When frontend is stopped, stop the backend
kill $BACKEND_PID
