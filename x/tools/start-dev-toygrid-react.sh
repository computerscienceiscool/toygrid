
#!/usr/bin/env bash

# ------------------------------------------------------------------------------
# File: x/tools/start-dev-toygrid-react.sh
# Description:
#   From the project root, this single script:
#     1) Kills any process on port 3099, then installs+starts y-websocket
#     2) Kills any process on port 3000, then installs+starts the React editor
#   Cleans up y-websocket on exit.
#
# Usage:
#   cd ~/lab/toygrid
#   x/tools/start-dev-toygrid-react.sh
#
# Requirements:
#   - ToyGrid code at ~/lab/toygrid
#   - No other shell scripts in root—only this under x/tools.
#   - Ports 3099 (y-websocket) and 3000 (React) free or will be freed.
#   - Commands: bash, lsof, node, npm on PATH.
# ------------------------------------------------------------------------------

set -euo pipefail

# === CONFIGURATION ===
ROOT_DIR="$HOME/lab/toygrid"
EDITOR_DIR="$ROOT_DIR/editor"
YJS_PORT=3099
TOYGRID_PORT=3000
YJS_LOG="$ROOT_DIR/yjs.log"
NODE_CMD=$(command -v node)
NPM_CMD=$(command -v npm)
LSOF_CMD=$(command -v lsof)

# === UTILITY FUNCTIONS ===

log() {
  printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$1"
}

kill_port() {
  local port=$1
  if "$LSOF_CMD" -i ":$port" &> /dev/null; then
    local pid
    pid=$("$LSOF_CMD" -t -i ":$port" | head -n1)
    if [[ -n "$pid" ]]; then
      log "Port $port is in use by PID $pid; killing it."
      kill -9 "$pid" || true
      log "Killed PID $pid on port $port."
    fi
  else
    log "Port $port is free."
  fi
}

cleanup() {
  if [[ -n "${YJS_PID-}" ]] && ps -p "$YJS_PID" &> /dev/null; then
    log "Stopping y-websocket (PID: $YJS_PID)..."
    kill "$YJS_PID" || true
    wait "$YJS_PID" 2>/dev/null || true
    log "OK: y-websocket stopped."
  fi
}
trap cleanup EXIT

# === MAIN ===

log "Starting ToyGrid dev (y-websocket + React) from x/tools..."

# Step 1: Kill any existing y-websocket on YJS_PORT
log "STEP 1: Freeing port $YJS_PORT for y-websocket"
kill_port "$YJS_PORT"

# Ensure editor folder exists
if [[ ! -d "$EDITOR_DIR" ]]; then
  log "ERROR: Cannot find editor folder at $EDITOR_DIR"
  exit 1
fi
cd "$EDITOR_DIR"

# Ensure y-websocket is installed (pin to 1.4.5)
if [[ ! -d "node_modules/y-websocket" ]]; then
  log "Installing y-websocket@1.4.5 in editor/..."
  "$NPM_CMD" install y-websocket@1.4.5
fi

# Launch y-websocket via PORT env (no --port flag)
: > "$YJS_LOG"
log "Launching y-websocket server via: PORT=$YJS_PORT $NODE_CMD node_modules/y-websocket/bin/server.js"
PORT="$YJS_PORT" "$NODE_CMD" node_modules/y-websocket/bin/server.js &> "$YJS_LOG" &
YJS_PID=$!
sleep 2

if ! ps -p "$YJS_PID" &> /dev/null; then
  log "ERROR: y-websocket failed to start. Check $YJS_LOG"
  exit 1
fi
log "OK: y-websocket running (PID: $YJS_PID, log: $YJS_LOG)"

# Step 2: Kill any existing React on TOYGRID_PORT
log "STEP 2: Freeing port $TOYGRID_PORT for React editor"
kill_port "$TOYGRID_PORT"

# Ensure React dependencies are installed
if [[ ! -d "node_modules" ]]; then
  log "Installing React editor dependencies..."
  "$NPM_CMD" install
fi

# Export env vars so React picks up WebSocket URL + port
export REACT_APP_YJS_WEBSOCKET_SERVER_URL="ws://127.0.0.1:$YJS_PORT"
export PORT="$TOYGRID_PORT"
log "INFO: React will use WS URL: $REACT_APP_YJS_WEBSOCKET_SERVER_URL"

# Run CRA in foreground; on ^C cleanup() will kill y-websocket
"$NPM_CMD" start

log "React exited; cleaning up y-websocket..."
# cleanup trap runs here
