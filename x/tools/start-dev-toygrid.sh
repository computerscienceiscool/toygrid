
#!/bin/bash

# === Configuration ===
YJS_DIR="$HOME/yjs-server"
EDITOR_DIR="$HOME/lab/toygrid/editor"
YJS_PORT=3099
EDITOR_PORT=3000
YJS_LOG="$YJS_DIR/yjs.log"

# === Step 1: Kill any processes using ports ===
echo "[STEP 1] Checking and clearing ports $YJS_PORT and $EDITOR_PORT..."

for port in $YJS_PORT $EDITOR_PORT; do
  PID=$(lsof -ti :$port)
  if [ -n "$PID" ]; then
    echo "[WARN] Port $port in use by PID $PID. Killing..."
    kill "$PID"
    sleep 1
    if ps -p "$PID" > /dev/null; then
      echo "[ERROR] Failed to kill PID $PID on port $port. Aborting."
      exit 1
    fi
    echo "[OK] Cleared port $port"
  fi
done

# === Step 2: Start Yjs WebSocket Server ===
echo "[STEP 2] Starting Yjs server on port $YJS_PORT..."
cd "$YJS_DIR" || { echo "[ERROR] Could not cd to $YJS_DIR"; exit 1; }

PORT=$YJS_PORT node server.js > "$YJS_LOG" 2>&1 &
YJS_PID=$!
sleep 2

if ! ps -p $YJS_PID > /dev/null; then
  echo "[ERROR] Yjs server failed to start. Last few lines of log:"
  tail -n 10 "$YJS_LOG"
  exit 1
fi

echo "[OK] Yjs server running (PID $YJS_PID)"
echo "[LOG] View log with: tail -f $YJS_LOG"
echo

# === Step 3: Start ToyGrid Editor ===
echo "[STEP 3] Starting ToyGrid editor on port $EDITOR_PORT..."
cd "$EDITOR_DIR" || { echo "[ERROR] Could not cd to $EDITOR_DIR"; exit 1; }

export REACT_APP_YJS_WEBSOCKET_SERVER_URL="ws://localhost:$YJS_PORT"

npm start &  # Start in background so we can open browser
EDITOR_PID=$!
sleep 3

# === Step 4: Open in browser ===
echo "[STEP 4] Opening ToyGrid in browser at http://localhost:$EDITOR_PORT..."
xdg-open "http://localhost:$EDITOR_PORT" > /dev/null 2>&1 || echo "[WARN] Could not open browser."

# === Summary ===
echo
echo "[DONE] Servers are running."
echo "  - Yjs PID:     $YJS_PID"
echo "  - Editor PID:  $EDITOR_PID"
echo "  - Editor URL:  http://localhost:$EDITOR_PORT"
echo
echo "To stop servers manually:"
echo "  kill $YJS_PID  # Yjs"
echo "  kill $EDITOR_PID  # ToyGrid"
