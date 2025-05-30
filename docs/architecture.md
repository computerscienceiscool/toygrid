# ToyGrid Architecture Overview

This document explains how the components of ToyGrid work together, focusing on the Yjs real-time editing system and the frontend architecture.

---

## Components

### 1. Yjs WebSocket Server (`yjs-server/`)
- A lightweight Node.js server that uses `ws`, `yjs`, `y-protocols`, and `lib0`.
- Responsible for receiving edits and broadcasting them to all connected clients.
- Can be started with:

```bash
PORT=1234 node server.js
```

- Source files:
  - `server.js` — the main HTTP + WebSocket listener
  - `lib/utils.js` — handles Yjs document setup and sync protocol

### 2. ToyGrid Frontend (`editor/`)
- A React-based collaborative editor built with real-time capabilities.
- Uses Yjs on the client side to manage shared document state.
- Connects to the WebSocket server using an environment variable.

Start it like this:

```bash
REACT_APP_YJS_WEBSOCKET_SERVER_URL=ws://localhost:1234 npm start
```

- Typical URL: http://localhost:3000

---

## Connection Overview

```
[ browser tab A ] <---> ws://localhost:1234 <---> [ browser tab B ]
        |                                             |
   React + Yjs                                 React + Yjs
```

- Edits made in one tab are synced through the WebSocket server to others.
- Each document is identified by the URL path (e.g., `/doc1` or `/testdoc`).

---

## Real-Time Logic

Yjs handles:
- Conflict resolution
- Document state
- Awareness of other users (optional)

The WebSocket server relays updates but doesn’t store them permanently — it’s a stateless message router.

---

## Local Development

1. Start the WebSocket server:
```bash
cd ~/yjs-server
PORT=1234 node server.js
```

2. In another terminal, run the frontend:
```bash
cd ~/lab/toygrid/editor
REACT_APP_YJS_WEBSOCKET_SERVER_URL=ws://localhost:1234 npm start
```

3. Open the app in two tabs:
http://localhost:3000

---


4. The Yjs WebSocket server (`yjs-server/`) includes a customized `utils.js` file with:
- JSON file-based persistence
- Debounced autosave
- Timestamped logs

The original file is saved as `utils_bu.js` for reference.

---

## Future Directions

- Deploy WebSocket server to Vesta or Europa
- Use Grid or IPFS for document persistence
- Consider a Yjs plugin for PromiseGrid
- Add user awareness and cursor sync features

---

## Credits

Built by JJ in May 2025. Designed to support live collaborative editing with modular, hackable components.
