
# ToyGrid Environment Variables

This document outlines environment variables used in the ToyGrid project, particularly for connecting the frontend to the Yjs WebSocket server.

---

## Required Environment Variables

### REACT_APP_YJS_WEBSOCKET_SERVER_URL

**Description**:  
Specifies the WebSocket server URL the frontend will use to sync Yjs documents.

**Used by**:  
`editor/src/App.jsx` and other Yjs-connected components.

**Example**:

```bash
REACT_APP_YJS_WEBSOCKET_SERVER_URL=ws://localhost:1234
```

**Usage**:

Temporarily set in terminal:

```bash
REACT_APP_YJS_WEBSOCKET_SERVER_URL=ws://localhost:1234 npm start
```

Or save to a `.env` file in the `editor/` folder:

```bash
# ~/lab/toygrid/editor/.env
REACT_APP_YJS_WEBSOCKET_SERVER_URL=ws://localhost:1234
```

---

## Optional Variables

None defined at this time. Additional configuration may be introduced as CI/CD and deployment progress.

---

## Notes

- Only variables prefixed with `REACT_APP_` are exposed to the browser in Create React App.
- If the environment variable is missing, the frontend may fail to connect or show document content.

