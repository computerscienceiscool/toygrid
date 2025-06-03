#!/bin/bash

# Description:
# Starts the ToyGrid frontend editor ONLY.
# Connects to a REMOTE Yjs WebSocket backend server.
# This script assumes the backend is already running and reachable.
# It will exit if the remote Yjs WebSocket server is not accessible.

# --- Configurable Settings ---
TOYGRID_DIR="$HOME/lab/toygrid"
EDITOR_DIR="$TOYGRID_DIR/editor"
YJS_SERVER_URL="ws://europa.d4.t7a.org:3000"
OPEN_BROWSER=false
FRONTEND_PORT=3000

# --- Check if remote Yjs WebSocket server is reachable ---
echo "[INFO] Checking if remote Yjs WebSocket server is reachable..."
if ! timeout 5 bash -c "</dev/tcp/europa.d4.t7a.org/3000" 2>/dev/null; then
  echo "[ERROR] Could not connect to remote Yjs server at $YJS_SERVER_URL"
  exit 1
fi

# --- Start ToyGrid Editor ---
echo "[INFO] Starting ToyGrid Editor (Vite)..."
cd "$EDITOR_DIR" || { echo "[ERROR] Could not find ToyGrid editor."; exit 1; }

export REACT_APP_YJS_WEBSOCKET_SERVER_URL="$YJS_SERVER_URL"
if grep -q '"start":' package.json; then
    nohup npm start > toygrid.log 2>&1 &
else
    nohup npx vite --port $FRONTEND_PORT > toygrid.log 2>&1 &
fi

EDITOR_PID=$!
sleep 3

# --- Optionally open in browser ---
if $OPEN_BROWSER; then
  echo "[INFO] Opening ToyGrid in browser..."
  xdg-open http://europa.d4.t7a.org:$FRONTEND_PORT > /dev/null 2>&1 || echo "[WARN] Could not open browser."
fi

# --- Summary ---
echo "[DONE] ToyGrid frontend started."
echo "  - Editor PID:      $EDITOR_PID"
echo "  - Connected to:    $YJS_SERVER_URL"
echo "  - URL:            http://europa.d4.t7a.org:$FRONTEND_PORT"
echo
echo "To stop: kill $EDITOR_PID"

