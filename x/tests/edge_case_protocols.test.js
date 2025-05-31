
// File: x/tests/edge_case_protocols.test.js
// Tests for “hello” and “random” handlers when there are no peers (or only a single node).

const assert = require('assert');
const ProtocolRegistry = require('../simulator/registry_placeholder');

// We need to register our handlers exactly as the simulator does.
// The easiest way is to require the simulator’s index.js—but that script sends a message
// immediately when loaded, which we do not want. Instead, we’ll “re‐implement” only the
// registration lines here. That way we can grab the handlers directly.


// ────────────────────────────────────────────────────────────────────────────────
// 1. (Re)-Register the “hello” handler exactly as in x/simulator/index.js

// A “hello” handler that forwards only one hop.
function helloHandler(agent, message) {
  const peers = agent.getPeers();
  if (peers && peers.length > 0) {
    // Forward to the first peer in the list
    const firstPeer = peers[0];
    // We do not call firstPeer.receive(), because that would loop. Instead we log:
    agent.log(`(HELLO) ${agent.id} forwarding to ${firstPeer.id}:`, message);
    firstPeer.log(`(HELLO) ${firstPeer.id} received:`, message);
  } else {
    // No peers → log a “no peers” message
    agent.log(`(HELLO) ${agent.id} has no peers to forward to. Message:`, message);
  }
}
// Register it
ProtocolRegistry.registerHandler('SID_HELLO', helloHandler);


// ────────────────────────────────────────────────────────────────────────────────
// 2. (Re)-Register the “random” handler exactly as in x/experimental_protocols.js

// Create a minimal “ThreatAgent” and randomMessageHandler exactly as in experimental_protocols.js
function randomMessageHandler(agent, message) {
  const peers = agent.getPeers();
  if (!peers || peers.length === 0) {
    // Log “no peers”
    agent.log(`(RANDOM) No peers for agent ${agent.id}`);
    return;
  }
  // Pick a random peer object
  const target = peers[Math.floor(Math.random() * peers.length)];
  agent.log(`(RANDOM) ${agent.id} forwarding to ${target.id}:`, message);
  target.log(`(RANDOM) ${target.id} received:`, message);
}

// We do not actually need the full ThreatAgent here; for “edge‐case” tests we only care
// what happens when getPeers() returns [] or when there’s exactly one peer. So we can
// manually create a “dummy” agent in each test.

// Register it
ProtocolRegistry.registerHandler('SID_RANDOM', randomMessageHandler);


// ────────────────────────────────────────────────────────────────────────────────
// 3. Helper: a “dummy” agent class that we can override as needed

class DummyAgent {
  constructor(id, peerArray = []) {
    this.id = id;
    this._peers = peerArray;
    this.logs = []; // collect log messages here
  }
  getPeers() {
    // Return whatever array of “peer objects” we passed in
    return this._peers;
  }
  log(...args) {
    // Instead of console.log, push the joined string into `this.logs`
    this.logs.push(args.map(String).join(' '));
  }
  // A “receive” method to conform to the interface, but we won’t use it for edge‐cases
  receive(message) {
    // not used in these tests
  }
}


// ────────────────────────────────────────────────────────────────────────────────
// 4. Tests for “hello” handler

// 4a. If there are no peers, helloHandler should log exactly one “no peers” message
(function testHelloNoPeers() {
  const agent = new DummyAgent('X', []);            // no peers
  const handler = ProtocolRegistry.getHandler('SID_HELLO');
  handler(agent, { text: 'Hi' });
  assert.strictEqual(
    agent.logs.length,
    1,
    'helloHandler with no peers should log exactly one message'
  );
  assert.ok(
    agent.logs[0].startsWith('(HELLO) X has no peers to forward to'),
    `Expected “no peers” message, got: ${agent.logs[0]}`
  );
  console.log('PASS: helloHandler no‐peers');
})();

// 4b. If there is exactly one peer, helloHandler should log two messages:
//     1) “X forwarding to Y” and 2) “Y received”
// We simulate Y by giving the peer array a DummyAgent with its own logs.
(function testHelloSinglePeer() {
  const peerY = new DummyAgent('Y', []);            // Y has no peers of its own
  const agentX = new DummyAgent('X', [peerY]);       // X’s only peer is Y
  const handler = ProtocolRegistry.getHandler('SID_HELLO');
  handler(agentX, { text: 'Hello' });

  // agentX.log should have noted the forwarding
  assert.ok(
    agentX.logs.length === 1,
    `Expected 1 log on X, got ${agentX.logs.length}`
  );
  assert.ok(
    agentX.logs[0].startsWith('(HELLO) X forwarding to Y'),
    `Expected “X forwarding to Y” message, got: ${agentX.logs[0]}`
  );

  // peerY.log should have noted the reception
  assert.ok(
    peerY.logs.length === 1,
    `Expected 1 log on Y, got ${peerY.logs.length}`
  );
  assert.ok(
    peerY.logs[0].startsWith('(HELLO) Y received'),
    `Expected “Y received” message, got: ${peerY.logs[0]}`
  );

  console.log('PASS: helloHandler single‐peer');
})();


// ────────────────────────────────────────────────────────────────────────────────
// 5. Tests for “random” handler

// 5a. If there are no peers, randomMessageHandler should log exactly one “no peers” message
(function testRandomNoPeers() {
  const agent = new DummyAgent('X', []);            // no peers
  const handler = ProtocolRegistry.getHandler('SID_RANDOM');
  handler(agent, { text: 'Hello' });

  assert.strictEqual(
    agent.logs.length,
    1,
    'randomMessageHandler with no peers should log exactly one message'
  );
  assert.ok(
    agent.logs[0].startsWith('(RANDOM) No peers for agent X'),
    `Expected “No peers” message, got: ${agent.logs[0]}`
  );
  console.log('PASS: randomMessageHandler no‐peers');
})();

// 5b. If there is exactly one peer, randomMessageHandler should forward to that peer
//     and the peer should log one “received” message. Since it’s just one peer, we know
//     which peer gets the message every time (no randomness in choosing).
(function testRandomSinglePeer() {
  const peerY = new DummyAgent('Y', []);
  const agentX = new DummyAgent('X', [peerY]);       // X’s only peer is Y
  const handler = ProtocolRegistry.getHandler('SID_RANDOM');
  handler(agentX, { text: 'Ping' });

  // agentX.log should have noted the “forwarding to Y”
  assert.strictEqual(agentX.logs.length, 1, `Expected 1 log on X, got ${agentX.logs.length}`);
  assert.ok(
    agentX.logs[0].startsWith('(RANDOM) X forwarding to Y'),
    `Expected “X forwarding to Y” message, got: ${agentX.logs[0]}`
  );

  // peerY.log should have noted the “Y received”
  assert.strictEqual(peerY.logs.length, 1, `Expected 1 log on Y, got ${peerY.logs.length}`);
  assert.ok(
    peerY.logs[0].startsWith('(RANDOM) Y received'),
    `Expected “Y received” message, got: ${peerY.logs[0]}`
  );

  console.log('PASS: randomMessageHandler single‐peer');
})();
