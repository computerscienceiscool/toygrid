
# Priority 1: ToyGrid Protocol Simulation

This directory contains the implementation and tests for Priority 1: swapping in a new message-routing protocol in the simulator. The goal was to add a "random-message" protocol alongside the existing "hello" protocol, implement a simple ThreatAgent (binary hyper-tree graph builder), and provide a toy simulation to demonstrate one-hop forwarding behavior.

## Folder Structure

```
x/
├── experimental_protocols.js
├── simulator/
│   ├── index.js
│   └── registry_placeholder.js
└── tests/
    ├── experimental_protocols.test.js
    └── edge_case_protocols.test.js
```

### `experimental_protocols.js`

* **Location**: `x/experimental_protocols.js`
* **Purpose**: Registers a new protocol identifier `SID_RANDOM` with the `ProtocolRegistry`, and defines:

  * `randomMessageHandler(agent, message)`: picks a random peer from `agent.getPeers()` and forwards the message once. The receiving peer simply logs receipt.
  * `ThreatAgent` class: given an `id` and a list of all peer IDs, it builds a simple binary hyper-tree neighbor map (up to two children). It exposes `getPeers()` so `randomMessageHandler` can forward correctly.
* **Usage**: When `SID_RANDOM` is selected, the simulator will use `ThreatAgent` to determine which peer(s) to forward to.

### `simulator/registry_placeholder.js`

* **Location**: `x/simulator/registry_placeholder.js`
* **Purpose**: A minimal stub for `ProtocolRegistry`, allowing registration and lookup of protocol handlers.

  * `registerHandler(protoId, fn)`: stores `fn` under `protoId`.
  * `getHandler(protoId)`: retrieves a registered handler function.
* **Usage**: Both `experimental_protocols.js` and `simulator/index.js` rely on this registry for handler lookup.

### `simulator/index.js`

* **Location**: `x/simulator/index.js`
* **Purpose**: A standalone Node.js script that demonstrates both the "hello" and "random" protocols on a tiny 3-node network (`A, B, C`).

  1. Imports `experimental_protocols.js` so `SID_RANDOM` and `ThreatAgent` get registered.
  2. Registers the "hello" handler (`SID_HELLO`) that forwards exactly one hop (A→B) and stops.
  3. Parses the CLI flag `--protocol <hello|random>` to choose which protocol to run.
  4. Defines a simple `Node` class with:

     * `send(protoId, payload)`: invokes the registered handler for `protoId`, passing `this` as the agent.
     * `receive(message)`: used by the "random" handler if multi-hop; logs receipt or forwards further.
     * `getPeers()`: returns the locally assigned `peer` list.
  5. Wires up three `Node` instances:

     * `A.peers = [B]`
     * `B.peers = [A, C]`
     * `C.peers = [B]`
  6. If `--protocol random` is chosen:

     * Constructs a `ThreatAgent` for node `A` over IDs `["A","B","C"]`.
     * Overrides `nodeA.getPeers()` to return actual `Node` objects (`B` and/or `C`) based on `ThreatAgent.neighbors`.
  7. Kicks off a single `send` from `A`. Each protocol then logs one forwarding and one receipt, with no recursion.
* **Usage**: Run `node x/simulator/index.js --protocol hello` or `node x/simulator/index.js --protocol random`.

### `tests/experimental_protocols.test.js`

* **Location**: `x/tests/experimental_protocols.test.js`
* **Purpose**: Verifies core functionality:

  1. **ThreatAgent neighbor construction**: For a set of peer IDs (e.g., `['A','B','C','D','E']`), ensures that a `ThreatAgent('B', [...])` has `neighbors['B']` equal to `['D','E']`.
  2. **Registry entry**: Confirms that `SID_RANDOM` has a function handler registered in `ProtocolRegistry`.
* **How to run**:

  ```bash
  cd ~/lab/toygrid
  node x/tests/experimental_protocols.test.js
  ```

  * **Expected output**: `All tests passed.`

### `tests/edge_case_protocols.test.js`

* **Location**: `x/tests/edge_case_protocols.test.js`
* **Purpose**: Covers edge cases for both protocols without requiring multi-hop logic:

  1. **helloHandler**:

     * **No peers**: Agent logs a single “no peers to forward to” message.
     * **Single peer**: Agent logs one “forwarding to <peer>” and the peer logs “received”.
  2. **randomMessageHandler**:

     * **No peers**: Agent logs a single “No peers” message.
     * **Single peer**: Agent logs “forwarding to <peer>” and the peer logs “received”.
* **How to run**:

  ```bash
  cd ~/lab/toygrid
  node x/tests/edge_case_protocols.test.js
  ```

  * **Expected output**:

    ```
    PASS: helloHandler no‐peers
    PASS: helloHandler single‐peer
    PASS: randomMessageHandler no‐peers
    PASS: randomMessageHandler single‐peer
    ```

## How to Run the Simulator (One-Hop Proof)

1. **Verify Node.js is installed**:

   ```bash
   node -v
   ```

   Should print a version (e.g., `v18.x.x`).

2. **Run the "hello" protocol**:

   ```bash
   cd ~/lab/toygrid
   node x/simulator/index.js --protocol hello
   ```

   * **Output**:

     ```
     >>> Using protocol: SID_HELLO
     (HELLO) A forwarding to B: { text: 'Hello from A' }
     [Node B] (HELLO) B received: { text: 'Hello from A' }
     ```

3. **Run the "random" protocol**:

   ```bash
   node x/simulator/index.js --protocol random
   ```

   * **Possible Outputs**:

     * If A forwards to B:

       ```
       >>> Using protocol: SID_RANDOM
       (RANDOM) A forwarding to B: { text: 'Hello from A' }
       [Node B] (RANDOM) B received: { text: 'Hello from A' }
       ```
     * If A forwards to C:

       ```
       >>> Using protocol: SID_RANDOM
       (RANDOM) A forwarding to C: { text: 'Hello from A' }
       [Node C] (RANDOM) C received: { text: 'Hello from A' }
       ```

## How to Run All Tests at Once

From the ToyGrid root directory (`~/lab/toygrid`):

```bash
node x/tests/experimental_protocols.test.js
node x/tests/edge_case_protocols.test.js
```

Both commands should complete without errors, confirming that the simulator code and edge‐case handlers behave as expected.

## Summary

Priority 1 deliverables include:

* **Experimental protocol definition** (`x/experimental_protocols.js`)
* **Toy simulator script** (`x/simulator/index.js`, `x/simulator/registry_placeholder.js`)
* **Unit tests** (`x/tests/experimental_protocols.test.js`, `x/tests/edge_case_protocols.test.js`)
* **README** (this file) explaining each component, its purpose, and how to run everything.

Once these pass review, you can confidently merge Priority 1 into production and move on to Priority 2 and 3.
