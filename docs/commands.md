# ToyGrid Command Reference

This document lists common commands used during development of the ToyGrid project. It includes commands for starting services, debugging, and interacting with both the frontend and Yjs WebSocket server.

---

## Yjs WebSocket Server (`~/yjs-server/`)

### Start the server

```bash
PORT=1234 node server.js
```

Runs the Yjs WebSocket server on port 1234. Required for document sync in the frontend.

### Stop the server

Press `Ctrl+C` in the terminal window where the server is running.

### View server logs

Server logs are printed to stdout (the terminal). Example messages:

```
Yjs WebSocket server listening on ws://localhost:1234
Connection to my-doc-name closed
```

---

## ToyGrid Frontend (`~/lab/toygrid/editor/`)

### Install dependencies (first time only)

```bash
npm install
```

### Start the React app

```bash
REACT_APP_YJS_WEBSOCKET_SERVER_URL=ws://localhost:1234 npm start
```

This launches the collaborative editor frontend. Opens in the browser at:

```
http://localhost:3000
```

### Stop the frontend

Press `Ctrl+C` in the terminal window where the app is running.

---

## Environment Variables

### Set WebSocket server URL (temporary)

```bash
REACT_APP_YJS_WEBSOCKET_SERVER_URL=ws://localhost:1234 npm start
```

### Optional: Save to `.env`

Create a file named `.env` in `~/lab/toygrid/editor/` with:

```
REACT_APP_YJS_WEBSOCKET_SERVER_URL=ws://localhost:1234
```

Then use:

```bash
npm start
```

---

## Other Useful Commands

### List open ports

```bash
lsof -i :3000
lsof -i :1234
```

### Kill process by port (if something is stuck)

```bash
fuser -k 3000/tcp
fuser -k 1234/tcp
```

---

## Summary

| Task                       | Command                                                      |
|----------------------------|--------------------------------------------------------------|
| Start Yjs Server           | `PORT=1234 node server.js`                                   |
| Start Frontend             | `REACT_APP_YJS_WEBSOCKET_SERVER_URL=ws://localhost:1234 npm start` |
| Kill port 3000             | `fuser -k 3000/tcp`                                          |
| Install frontend packages  | `npm install`                                                |
| List processes on port     | `lsof -i :3000` or `lsof -i :1234`                           |


