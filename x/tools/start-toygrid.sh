#!/bin/bash

# Description:
# Starts the ToyGrid editor with a defined YJS WebSocket server URL
# Intended for local dev or server launch
# Optional: Starts Yjs WebSocket server if requested

# --- Configurable Settings ---
TOYGRID_DIR="$HOME/lab/toygrid"
EDITOR_DIR="$TOYGRID_DIR/editor"
YJS_SERVER_URL="ws://localhost:3099"  # Change for remote e.g., ws://europa.d4.t7a.org:3000
OPEN_BROWSER=true
START_YJS=false

# --- Start optional YJS WebSocket server ---
if $START_YJS; then
  echo "[INFO] Starting Yjs WebSocket server..."
  cd "$HOME/yjs-server" || { echo "[ERROR] Could not find yjs-server dir."; exit 1; }
  PORT=3099 nohup node server.js > yjs.log 2>&1 &
  YJS_PID=$!
  sleep 2

  if ! ps -p $YJS_PID > /dev/null; then
    echo "[ERROR] Yjs server failed to start. Log tail:"
    tail -n 10 yjs.log
    exit 1
  fi
  echo "[OK] Yjs WebSocket server started (PID $YJS_PID)"
fi

# --- Start ToyGrid Editor ---
echo "[INFO] Starting ToyGrid Editor (Vite)..."
cd "$EDITOR_DIR" || { echo "[ERROR] Could not find ToyGrid editor."; exit 1; }

# Export env var and run Vite
export REACT_APP_YJS_WEBSOCKET_SERVER_URL="$YJS_SERVER_URL"
if grep -q '"start":' package.json; then
    nohup npm start > toygrid.log 2>&1 &
else
    nohup npx vite > toygrid.log 2>&1 &
fi

EDITOR_PID=$!

sleep 3

# --- Optionally open in browser ---
if $OPEN_BROWSER; then
  echo "[INFO] Opening ToyGrid in browser..."
  xdg-open http://localhost:5173 > /dev/null 2>&1 || echo "[WARN] Could not open browser."
fi

# --- Summary ---
echo "[DONE] ToyGrid startup complete."
$START_YJS && echo "  - Yjs Server PID:  $YJS_PID"
echo "  - Editor PID:      $EDITOR_PID"
echo "  - URL:             http://localhost:5173"
echo
echo "To stop: kill $EDITOR_PID"
$START_YJS && echo "To stop Yjs: kill $YJS_PID"

