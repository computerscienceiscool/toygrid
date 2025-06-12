
const fs = require('fs');
const Y = require('yjs');

function extractTextFromXmlFragment(xmlFragment) {
  let text = '';
  for (const node of xmlFragment.toArray()) {
    if (node instanceof Y.XmlElement) {
      text += extractTextFromXmlFragment(node); // recurse
    } else if (node instanceof Y.XmlText) {
      text += node.toString();
    }
  }
  return text;
}

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

console.log('--- Snapshot Plaintext Content ---');
for (const [key, value] of ydoc.share.entries()) {
  if (value instanceof Y.XmlFragment) {
    const txt = extractTextFromXmlFragment(value);
    console.log(`→ ${key}:`);
    console.log(txt.trim() || '[Empty]');
  }
}
console.log('----------------------------------');
