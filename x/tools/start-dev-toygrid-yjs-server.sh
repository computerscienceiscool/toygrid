#!/bin/bash

# Start the Yjs WebSocket server in the background
#echo "[INFO] Starting Yjs WebSocket server on port 3000..."
#cd ~/yjs-server || { echo "[ERROR] Could not find ~/yjs-server"; exit 1; }
#PORT=3000 node server.js > yjs.log 2>&1 &
#YJS_PID=$!
#sleep 2

# Check if the server actually started
#if ! ps -p $YJS_PID > /dev/null; then
#  echo "[ERROR] Yjs server failed to start."
#  echo "Here’s the last few lines of yjs.log:"
#  tail -n 10 yjs.log
#  exit 1
#fi

#echo "[OK] Yjs server started with PID $YJS_PID"

# Start the ToyGrid frontend
echo "[INFO] Starting ToyGrid editor..."
cd ~/lab/toygrid/editor || { echo "[ERROR] Could not find ~/lab/toygrid/editor"; exit 1; }
REACT_APP_YJS_WEBSOCKET_SERVER_URL=ws://europa.d4.t7a.org:3000 nohup npm start > toygrid.log 2>&1 &
EDITOR_PID=$(pgrep -f "react-scripts start")
sleep 3

# Open the editor in the default browser (Linux, no icons!)
echo "[INFO] Opening ToyGrid in browser..."
xdg-open http://europa.d4.t7a.org:3000 > /dev/null 2>&1 || echo "[WARN] Could not open browser"

# Final message
echo "[DONE] Both servers are now running."
echo "  - Yjs PID:     $YJS_PID"
echo "  - ToyGrid PID: $EDITOR_PID"
echo "  - URL:         http://europa.d4.t7a.org:3000"
echo
echo "Use 'kill $YJS_PID' or 'kill $EDITOR_PID' to stop them if needed."
