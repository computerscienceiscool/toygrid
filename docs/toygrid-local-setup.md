
#  ToyGrid Local Setup Guide

This guide walks you through setting up the **Yjs WebSocket Server** and **ToyGrid frontend** for local development.

---

##  Prerequisites

Make sure you have the following installed:

- Node.js (v18+ recommended)
- npm (Node package manager)
- A terminal
- A code editor (Vim preferred by our team)
- A modern web browser (Chrome/Firefox)

---

##  Step 1: Set Up the Yjs WebSocket Server

```bash
cd ~
mkdir yjs-server
cd yjs-server
npm init -y
npm install ws yjs y-protocols lib0
```

### Create `server.js`:

```bash
vim server.js
```

Paste this content:

```js
const WebSocket = require('ws');
const http = require('http');
const Y = require('yjs');
const { setupWSConnection } = require('./lib/utils.js');

const port = process.env.PORT || 1234;
const server = http.createServer((_, res) => {
  res.writeHead(200);
  res.end('Yjs WebSocket server is running.\n');
});

const wss = new WebSocket.Server({ server });
wss.on('connection', setupWSConnection);

server.listen(port, () => {
  console.log(`Yjs WebSocket server listening on ws://localhost:${port}`);
});
```

### Create `lib/utils.js`:

```bash
mkdir -p lib
vim lib/utils.js
```

Paste this:

```js
const WebSocket = require('ws');
const Y = require('yjs');
const encoding = require('lib0/encoding');
const decoding = require('lib0/decoding');
const map = require('lib0/map');
const awarenessProtocol = require('y-protocols/awareness');
const syncProtocol = require('y-protocols/sync');

const docs = new Map();

const setupWSConnection = (conn, req) => {
  const docName = req.url.slice(1).split('?')[0];
  const doc = map.setIfUndefined(docs, docName, () => {
    const ydoc = new Y.Doc();
    ydoc.gc = true;
    return ydoc;
  });

  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, syncProtocol.messageYjsSyncStep1);
  syncProtocol.writeSyncStep1(encoder, doc);
  conn.send(encoding.toUint8Array(encoder));

  conn.on('message', (message) => {
    const decoder = decoding.createDecoder(new Uint8Array(message));
    const messageType = decoding.readVarUint(decoder);
    if (messageType === syncProtocol.messageYjsSyncStep2) {
      syncProtocol.readSyncStep2(decoder, doc);
    }
  });

  conn.on('close', () => {
    console.log(`Connection to ${docName} closed`);
  });
};

module.exports = { setupWSConnection };
```

### Start the Server:

```bash
PORT=1234 node server.js
```

You should see:

```
Yjs WebSocket server listening on ws://localhost:1234
```

---

## Step 2: Run the ToyGrid Frontend

Open a second terminal:

```bash
cd ~/lab/toygrid/editor
REACT_APP_YJS_WEBSOCKET_SERVER_URL=ws://localhost:1234 npm start
```

Then open [http://localhost:3000](http://localhost:3000) in two browser tabs to test real-time sync.

---

##  Success!

You now have ToyGrid running locally with Yjs WebSocket-based sync.

---

##  Credits

This setup was built by JJ, step by step, to support the ToyGrid initiative.
