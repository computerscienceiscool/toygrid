# ToyGrid

ToyGrid is a real-time collaborative document editor built with React and Yjs, using a custom WebSocket server for document syncing. This project is used to prototype collaborative features, decentralized sync patterns, and grid-based coordination.

---

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd toygrid
```

### 2. Set up the WebSocket Server

```bash
cd ~/yjs-server
PORT=1234 node server.js
```

See `docs/TOYGRID_SETUP.md` for full server setup instructions.

### 3. Start the Frontend

```bash
cd editor
REACT_APP_YJS_WEBSOCKET_SERVER_URL=ws://localhost:1234 npm start
```

This will open the editor at [http://localhost:3000](http://localhost:3000)

---

## Documentation

Project documentation is in the `docs/` folder:

- `TOYGRID_SETUP.md` – Full setup walkthrough
- `architecture.md` – Component overview
- `commands.md` – Common development commands
- `env.md` – Environment variable reference
- `troubleshooting.md` – Common issues and fixes

---

## Requirements

- Node.js v18+
- npm v9+
- Modern browser (Chrome or Firefox)
- Two terminals (one for server, one for frontend)

---

## Future Plans

- Support IPFS/Grid-backed storage
- Add PromiseGrid wire protocol compatibility
- Implement basic chat/cursor awareness features
- Explore decentralized sync (Yjs + WebRTC)

---

## License

ICS License (see LICENSE file)

