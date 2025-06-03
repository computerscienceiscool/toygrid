
# Tools (`x/tools/`)

This folder contains utility shell scripts used for developing and launching ToyGrid components. All scripts are intended to be run from the root directory of the project.

## Scripts

### 1. `start-dev-toygrid-react.sh`

**Description**:
Starts the ToyGrid frontend React development server using Vite.

**How to run**:

```bash
./x/tools/start-dev-toygrid-react.sh
```

---

### 2. `start-dev-toygrid-yjs-server.sh`

**Description**:
Launches the Yjs WebSocket server used for real-time collaboration in ToyGrid. This is essential for enabling Yjs document sync.

**How to run**:

```bash
./x/tools/start-dev-toygrid-yjs-server.sh
```

---

### 3. `start-dev-toygrid.sh`

**Description**:
Starts all essential development services: the Go backend server, the Yjs WebSocket server, and the React frontend.

**How to run**:

```bash
./x/tools/start-dev-toygrid.sh
```

---

### 4. `start-toygrid.sh`

**Description**:
Runs ToyGrid in production mode. This script assumes all assets are pre-built and launches the Go server with production-ready settings.

**How to run**:

```bash
./x/tools/start-toygrid.sh
```
