
// File: x/tests/experimental_protocols.test.js
// Simple tests for ThreatAgent neighbor construction and registry entries

const assert = require('assert');
const ProtocolRegistry = require('../simulator/registry_placeholder');
const { ThreatAgent, SID_RANDOM } = require('../experimental_protocols');

// Test: ThreatAgent should build correct neighbors for a binary tree
// Given peers ['A', 'B', 'C', 'D', 'E'], the tree indexing yields:
// 'A' -> ['B', 'C']
// 'B' -> ['D', 'E']
// 'C' -> []
// (only validate for one agent)
const agentB = new ThreatAgent('B', ['A', 'B', 'C', 'D', 'E']);
assert.deepStrictEqual(
  agentB.neighbors['B'],
  ['D', 'E'],
  'ThreatAgent neighbors for B should be ["D", "E"]'
);

// Test: SID_RANDOM should have a handler registered in the registry
const randomHandler = ProtocolRegistry.getHandler(SID_RANDOM);
assert(
  typeof randomHandler === 'function',
  'SID_RANDOM handler should be registered as a function'
);

console.log('All tests passed.');
