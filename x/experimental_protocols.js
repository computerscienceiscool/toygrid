// File: x/experimental_protocols.js
// Experimental protocols and agents under toygrid/x

// Minimal ProtocolRegistry stub for registering handlers
const ProtocolRegistry = require('./simulator/registry_placeholder');

// Protocol ID for random-message routing
const SID_RANDOM = 'SID_RANDOM';

/**
 * Handler for the random-message protocol.
 * On receiving a message (always from A), pick a random peer and forward once.
 * The receiving peer will just log receipt, without further forwarding.
 */
function randomMessageHandler(agent, message) {
  const peers = agent.getPeers();
  if (!peers || peers.length === 0) {
    console.log(`No peers for agent ${agent.id}`);
    return;
  }
  // Pick a random peer object from the array
  const target = peers[Math.floor(Math.random() * peers.length)];
  console.log(`(RANDOM) ${agent.id} forwarding to ${target.id}:`, message);
  // Directly log on the target (no further recursion into randomMessageHandler)
  target.log(`(RANDOM) ${target.id} received:`, message);
}

/**
 * ThreatAgent class constructs a binary hyper-tree topology over all given peer IDs.
 * It exposes `getPeers()` so randomMessageHandler can forward to one of its children.
 */
class ThreatAgent {
  constructor(id, allPeerIds) {
    this.id = id;
    this.neighbors = {};
    this.buildNeighbors(allPeerIds);
  }

  // Build a simple binary-tree neighbor map: each node has up to two children
  buildNeighbors(allPeerIds) {
    const index = allPeerIds.indexOf(this.id);
    if (index === -1) return;
    const leftChildIdx = 2 * index + 1;
    const rightChildIdx = 2 * index + 2;
    const children = [];
    if (leftChildIdx < allPeerIds.length) {
      children.push(allPeerIds[leftChildIdx]);
    }
    if (rightChildIdx < allPeerIds.length) {
      children.push(allPeerIds[rightChildIdx]);
    }
    this.neighbors[this.id] = children;
  }

  // getPeers() returns an array of “peer objects” with the minimal interface { id, log(msg) }
  getPeers() {
    // Map each child ID into a fake Node-like object with only `id` and `log(msg)` stub
    return (this.neighbors[this.id] || []).map(peerId => ({
      id: peerId,
      log: (msgType, msg) => console.log(`[Node ${peerId}] ${msgType} ${msg}`)
    }));
  }
}

// Register the random-message protocol handler with the registry
ProtocolRegistry.registerHandler(SID_RANDOM, randomMessageHandler);

// Export ThreatAgent and the SID_RANDOM constant
module.exports = { ThreatAgent, SID_RANDOM };

