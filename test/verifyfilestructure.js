const fs = require('fs');
const Y = require('yjs');

const file = process.argv[2];
if (!file) {
  console.error('Usage: node test/verifysnapshotplaintext.js snapshot.json');
  process.exit(1);
}

let raw;
try {
  raw = JSON.parse(fs.readFileSync(file, 'utf8'));
} catch (err) {
  console.error('Failed to read or parse file:', err.message);
  process.exit(1);
}

if (!raw.update || !Array.isArray(raw.update)) {
  console.error('Invalid snapshot format: missing or invalid "update" field');
  process.exit(1);
}

const ydoc = new Y.Doc();
const update = Uint8Array.from(raw.update);
Y.applyUpdate(ydoc, update);

console.log('--- Snapshot Content ---');
for (const [key, value] of ydoc.share.entries()) {
  console.log(`→ ${key}: ${value.constructor.name}`);
  if (value instanceof Y.Text) {
    console.log(value.toString());
  } else if (value instanceof Y.Map || value instanceof Y.Array) {
    console.log(JSON.stringify(value.toJSON(), null, 2));
  } else {
    // fallback: attempt raw inspect
    console.log('[Raw dump]:', value);
  }
  console.log();
}
console.log('------------------------');

