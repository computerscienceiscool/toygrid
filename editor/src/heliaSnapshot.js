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

/**
 * Save a human-readable JSON snapshot of the full Yjs document state (Option 2).
 * This is useful for debugging, inspection, or auditing document contents.
 *
 * @param {Y.Doc} ydoc - The Yjs document to snapshot
 * @returns {Promise<string>} - The filename written (or thrown error)
 */
export async function saveSnapshotAsJSON(ydoc) {
  try {
    // STEP 1: Serialize the full Yjs state to JSON
    const jsonState = ydoc.toJSON()

    // STEP 2: Construct a timestamped filename for the JSON snapshot
    const now = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `snapshot-${now}-data.json`

    // STEP 3: Access the browser's OPFS
    const root = await navigator.storage.getDirectory()

    // STEP 4: Create or overwrite the snapshot file
    const handle = await root.getFileHandle(filename, { create: true })
    const writable = await handle.createWritable()

    // STEP 5: Write the readable JSON to the file (indented for clarity)
    await writable.write(JSON.stringify(jsonState, null, 2))
    await writable.close()

    console.log(`[Snapshot] Saved Yjs JSON snapshot to OPFS: ${filename}`)
    return filename
  } catch (error) {
    console.error('[Snapshot] Failed to save JSON snapshot to OPFS:', error)
    throw error
  }
}
