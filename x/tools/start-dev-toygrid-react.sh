
#!/bin/bash

# ------------------------------------------------------------------------------
# Script: start-dev-toygrid-react.sh
# Description:
#   Starts the ToyGrid collaborative editor using react-scripts (port 3000)
#   and optionally starts the Yjs WebSocket server (port 3099) locally.
#
# Usage:
#   ./x/tools/start-dev-toygrid-react.sh
#
# Requirements:
#   - ToyGrid project at ~/lab/toygrid
#   - Yjs server located at ~/yjs-server/server.js
#   - Ports 3000 (ToyGrid) and 3099 (Yjs) must be available
# ------------------------------------------------------------------------------

# === CONFIG ===
TOYGRID_DIR="$HOME/lab/toygrid"
EDITOR_DIR="$TOYGRID_DIR/editor"
YJS_SERVER_DIR="$HOME/yjs-server"
YJS_PORT=3099
TOYGRID_PORT=3000
REACT_APP_YJS_WEBSOCKET_SERVER_URL="ws://localhost:$YJS_PORT"

# === UTILITY ===
function check_port() {
  if lsof -i ":$1" > /dev/null; then
    echo "[WARN] Port $1 is already in use. Check for conflicts."
    lsof -i ":$1"
    return 1
  else
    echo "[OK] Port $1 is available."
    return 0
  fi
}

# === STEP 1: Start Yjs WebSocket Server ===
echo "[STEP 1] Starting Yjs WebSocket server on port $YJS_PORT..."
check_port $YJS_PORT || {
  echo "[ERROR] Yjs port $YJS_PORT is in use. Aborting."
  exit 1
}

cd "$YJS_SERVER_DIR" || {
  echo "[ERROR] Could not find $YJS_SERVER_DIR"
  exit 1
}

PORT=$YJS_PORT node server.js &
YJS_PID=$!
sleep 2

if ! ps -p $YJS_PID > /dev/null; then
  echo "[ERROR] Failed to launch Yjs server."
  echo "Recent log lines (if any):"
  tail -n 10 yjs.log
  exit 1
fi

echo "[OK] Yjs server running (PID: $YJS_PID) at ws://localhost:$YJS_PORT"
echo

# === STEP 2: Launch ToyGrid Editor ===
echo "[STEP 2] Launching ToyGrid editor (react-scripts) on port $TOYGRID_PORT..."
check_port $TOYGRID_PORT || {
  echo "[ERROR] ToyGrid port $TOYGRID_PORT is in use. Aborting."
  kill $YJS_PID
  exit 1
}

cd "$EDITOR_DIR" || {
  echo "[ERROR] Could not find editor at $EDITOR_DIR"
  kill $YJS_PID
  exit 1
}

# Export the environment variable so the editor connects to Yjs
export REACT_APP_YJS_WEBSOCKET_SERVER_URL="$REACT_APP_YJS_WEBSOCKET_SERVER_URL"
echo "[INFO] Using Yjs URL: $REACT_APP_YJS_WEBSOCKET_SERVER_URL"
echo

# Run in foreground so errors are visible
npm start

# === CLEANUP INSTRUCTIONS ===
echo
echo "[INFO] ToyGrid exited. Cleaning up Yjs server..."
kill $YJS_PID && echo "[OK] Yjs server stopped (PID: $YJS_PID)"
echo "[DONE] All services stopped."
