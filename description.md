
# ToyGrid Platform Components

## Core Architecture
Web-based platform combining:
- Go WebAssembly (WASM) modules
- React-based collaborative editor
- Microfrontend architecture
- Real-time collaboration using CRDTs (Yjs)
- Browser-based persistence (IndexedDB)

## Key Components

### 1. Version Management (`ckversion.js`)
```javascript
// Client-side version checking
- Checks `/version` endpoint for updates
- Uses localStorage to track versions
- Forces full reload on version mismatch
- Prevents stale cache issues
```

### 2. WASM Loader (`wasmgo.js`)
```javascript
// Universal WASM initialization
- Standardizes Go WASM instantiation
- Supports multiple WASM modules
- Handles async loading
```

### 3. Database Interface (`db/main.go`)
```go
// IndexedDB wrapper
- Browser-based key-value storage
- CRUD operations via Go WASM
- UI controls for data management
- Automatic crash reporting
```

### 4. Collaborative Editor (`App.jsx`)
```jsx
// Real-time collaborative editor
- TipTap ProseMirror base
- Yjs CRDT backend
- Presence indicators
- Multi-user cursors
- Rich text formatting
```

### 5. WebSocket System (`websocket.go`)
```go
// Real-time communication
- Broadcast messaging
- Client management
- Echo service
- Connection pooling
```

### 6. Build System (`Makefile`)
```makefile
# Unified build pipeline
- WASM compilation
- React editor build
- Deployment automation
- Version tracking
```

## Server Components

### 1. Main Server (`server/server.go`)
```go
// Core services
- Static file server
- Version endpoint
- WebSocket endpoints:
  - /echo (debug)
  - /broadcast (pub/sub)
- Port 9073 by default
```

### 2. WebSocket Hub (`websocket.go`)
```go
// Real-time features
- Connection management
- Message broadcasting
- Presence tracking
- Graceful error handling
```

### Build tiptap 

This appears to be needed by 'make tiptap' before running 'make tiptap' on laptop:

```bash
# place this in local/env
export REACT_APP_YJS_WEBSOCKET_SERVER_URL=ws://localhost:3099
```

### Build toygrid server binary

This is handled by 'make build':

```bash
make build 
```

## Startup Sequence

### 1. Required Services

This appears to be being done by 'make run-yjs':

```bash
# Yjs WebSocket Server (separate terminal)
cd ~/lab/yjs/websocket-server
PORT=3099 HOST=0.0.0.0 npx y-websocket
```

### 2. Start Backend Server

This is handled by 'make run':

```bash
./toygrid ~/lab/cswg/toygrid/public
```


## Runtime Characteristics
- Single-page application (SPA) architecture
- Automatic cache busting
- Multi-user collaboration
- Browser-based persistence
- Graceful error recovery
- Cross-component version sync
