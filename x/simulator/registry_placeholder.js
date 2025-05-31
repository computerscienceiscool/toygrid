// File: x/simulator/registry_placeholder.js
// A minimal ProtocolRegistry stub to let us register and look up handlers.

const handlers = {};

module.exports = {
  registerHandler(protoId, fn) {
    handlers[protoId] = fn;
  },
  getHandler(protoId) {
    return handlers[protoId];
  }
};
