
// File: x/simulator/index.js
// A very simple "toy" bootstrapper for protocols under x/experimental_protocols.js.
// Usage:
//   $ node x/simulator/index.js --protocol hello
//   $ node x/simulator/index.js --protocol random

// 1. Import the experimental protocols so that SID_RANDOM (and ThreatAgent) get registered.
require('../experimental_protocols');

// 2. Load the ProtocolRegistry stub to register "hello" and look up handlers...
const ProtocolRegistry = require('./registry_placeholder');

// 3. Parse CLI flags:
const args = process.argv.slice(2);
let chosenProto = 'SID_HELLO'; // default
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--protocol' && args[i + 1]) {
    if (args[i + 1] === 'hello') chosenProto = 'SID_HELLO';
    else if (args[i + 1] === 'random') chosenProto = 'SID_RANDOM';
    i++;
  }
}

// 4. Register a "hello" handler that forwards only one hop, then stops
function helloHandler(agent, message) {
  const peers = agent.getPeers();
  if (peers && peers.length > 0) {
    // Forward to the first peer in the list, and that peer logs receipt without further forwarding
    const firstPeer = peers[0];
    console.log(`(HELLO) ${agent.id} forwarding to ${firstPeer.id}:`, message);
    // Use firstPeer.log() directly—do not call receive(), so it doesn’t cause recursion
    firstPeer.log(`(HELLO) ${firstPeer.id} received:`, message);
  } else {
    // If no peers, just log on this node
    agent.log(`(HELLO) ${agent.id} has no peers to forward to. Message:`, message);
  }
}
ProtocolRegistry.registerHandler('SID_HELLO', helloHandler);

// 5. Build a tiny network of 3 agents (A, B, C)
class Node {
  constructor(id) {
    this.id = id;
    this.peers = []; // array of Node objects
  }
  send(protoId, payload) {
    const handler = ProtocolRegistry.getHandler(protoId);
    if (!handler) throw new Error(`No handler for ${protoId}`);
    handler(this, payload);
  }
  receive(message) {
    // Only the "random" protocol uses receive() to invoke its handler
    const handler = ProtocolRegistry.getHandler(chosenProto);
    if (!handler) throw new Error(`No handler for ${chosenProto}`);
    handler(this, message);
  }
  log(...args) {
    console.log(`[Node ${this.id}]`, ...args);
  }
  getPeers() {
    return this.peers;
  }
}

// Instantiate three nodes and wire them as peers (will rewire for random)
const nodeA = new Node('A');
const nodeB = new Node('B');
const nodeC = new Node('C');
nodeA.peers = [nodeB];        // A’s first peer is B
nodeB.peers = [nodeA, nodeC]; // B’s first peer is A, second is C
nodeC.peers = [nodeB];        // C’s first peer is B

// 6. Override A for random protocol to use ThreatAgent neighbors
if (chosenProto === 'SID_RANDOM') {
  const { ThreatAgent } = require('../experimental_protocols');
  // Build a ThreatAgent for A
  const threatA = new ThreatAgent('A', ['A', 'B', 'C']);
  // Override nodeA.getPeers to return Node objects based on threatA.neighbors
  nodeA.getPeers = function() {
    const childIds = threatA.neighbors[this.id] || [];
    return childIds.map(id => {
      if (id === 'B') return nodeB;
      if (id === 'C') return nodeC;
      return null;
    }).filter(n => n);
  };
}

// 7. Kick off a send from A
console.log(`\n>>> Using protocol: ${chosenProto}`);
nodeA.send(chosenProto, { text: 'Hello from A' });
