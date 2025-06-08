//  Save Yjs document snapshots to the browser's OPFS (Origin Private FileSystem)

import * as Y from 'yjs'

/**
 * Save a binary snapshot of the current Yjs state using encodeStateAsUpdate (Option 1).
 * This file is stored in OPFS and is NOT part of IndexedDB or synced to Helia.
 *
 * @param {Y.Doc} ydoc - The Yjs document to snapshot
 * @returns {Promise<string>} - The filename written (or thrown error)
 */
export async function saveSnapshotToOPFS(ydoc) {
  try {
    // STEP 1: Encode current Yjs state into a compact binary Uint8Array
    const update = Y.encodeStateAsUpdate(ydoc)

    // STEP 2: Construct a timestamped filename for the binary update
    const now = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `snapshot-${now}-update.bin`

    // STEP 3: Access the browser's Origin Private FileSystem (OPFS)
    const root = await navigator.storage.getDirectory()

    // STEP 4: Create or overwrite the snapshot file
    const handle = await root.getFileHandle(filename, { create: true })
    const writable = await handle.createWritable()

    // STEP 5: Write the encoded Yjs update to the file
    await writable.write(update)
    await writable.close()

    console.log(`[Snapshot] Saved binary Yjs update to OPFS: ${filename}`)
    return filename
  } catch (error) {
    console.error('[Snapshot] Failed to save binary snapshot to OPFS:', error)
    throw error
  }
}

// Save a JSON-encoded Yjs update snapshot
export async function saveSnapshotAsJSON(ydoc) {
  try {
    const update = Y.encodeStateAsUpdate(ydoc)
    const json = { update: Array.from(update) }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `snapshot-${timestamp}.json`
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' })

    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(a.href)

    console.log('[Snapshot] Downloaded Yjs update snapshot as', filename)
    return filename
  } catch (err) {
    console.error('Failed to save snapshot as JSON:', err)
    alert('Error: Could not save Yjs snapshot to disk.')
    return null
  }
}


// load snapshot from OPFS
export async function loadSnapshotFromOPFS() {
  try {
    const root = await navigator.storage.getDirectory();
    const entries = [];
    for await (const [name, handle] of root.entries()) {
      if (name.endsWith('.json')) {
        entries.push({ name, handle });
      }
    }

    if (entries.length === 0) {
      alert('No snapshot JSON files found.');
      return null;
    }

    // For simplicity, use the most recent one
    const latest = entries.sort((a, b) => b.name.localeCompare(a.name))[0];
    const file = await latest.handle.getFile();
    const content = await file.text();
    const json = JSON.parse(content);
    return json;
  } catch (err) {
    console.error('Failed to load snapshot:', err);
    alert('Failed to load snapshot.');
    return null;
  }
}





// Apply a Yjs update snapshot (from JSON) to a Y.Doc
export function applySnapshotToYdoc(json, ydoc) {
  try {
    if (!json || !Array.isArray(json.update)) {
      throw new Error('Invalid snapshot format: "update" field missing or not an array.')
    }

    const update = Uint8Array.from(json.update)

    if (!(ydoc instanceof Y.Doc)) {
      throw new Error('Target ydoc is not a valid Y.Doc instance.')
    }

    Y.applyUpdate(ydoc, update)
    ydoc.emit('update', update)



  //  ydoc.emit('update', Y.encodeStateAsUpdate(ydoc)); // Notify listeners of the update
    console.log('[applySnapshotToYdoc] Snapshot applied successfully.')
    alert('Snapshot applied and editor should be updated.')    
  } catch (err) {
    console.error('[applySnapshotToYdoc] Failed to apply snapshot:', err)
    alert('Failed to apply snapshot: ' + err.message)
  }
}

// Load a snapshot from OPFS and apply it to a Yjs document
export async function loadSnapshotToYdoc(ydoc) {
  const json = await loadSnapshotFromOPFS()
  if (json) {
    applySnapshotToYdoc(json, ydoc)
  }
}
