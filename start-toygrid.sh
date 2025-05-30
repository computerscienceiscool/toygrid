#!/bin/bash

# Stop immediately if any command fails
set -e

# Choose your preferred port here (not 8888)
PORT=8080  # changed port to 8080

# Step 1: Build the frontend
echo "Building frontend..."
cd editor
npm install
npm run build
cd ..

# Step 2: Launch the browser (works on most Linux desktops)
echo "Opening browser at http://localhost:$PORT"
xdg-open http://localhost:$PORT &

# Step 3: Start the Go backend
echo "Starting Go backend on port $PORT..."
cd server
go run . ../editor/build

