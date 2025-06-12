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
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `snapshot-${timestamp}-update.bin`

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

// Save a Yjs update snapshot
export async function saveSnapshotAsJSON(ydoc) {
  try {
    const update = Y.encodeStateAsUpdate(ydoc)

    const json = { update: Array.from(update) }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `snapshot-${timestamp}.ysnap.json`
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' })

    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(a.href)

    console.log('[Snapshot] Downloaded Yjs update snapshot as', filename)

    // also downloading a txt file at the same time.....
    // comment out this block to disable the txt file download
   /* 
    try {



      const ytext = ydoc.getText('prosemirror')
      console.log('[DEV] Text to save:', ytext.toString())
          const textContent = ytext.toString()
      const textBlob = new Blob([textContent], { type: 'text/plain' })

      const textLink = document.createElement('a')
      textLink.href = URL.createObjectURL(textBlob)
      textLink.download = `snapshot-${timestamp}.txt`
      document.body.appendChild(textLink)
      textLink.click()
      document.body.removeChild(textLink)
      URL.revokeObjectURL(textLink.href)

      console.log('[Snapshot] Also exported plain text version of document.')
    } catch (textErr) {
      console.warn('[Snapshot] Could not export plain text:', textErr)
    }
    */ // end of text file download block
      


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


// This function applies a JSON snapshot to a fresh Y.Doc instance
export function applySnapshotToYdoc(json) {
  try {
    // STEP 1: Validate snapshot format
    if (!json || !Array.isArray(json.update)) {
      throw new Error('Invalid snapshot format: "update" field missing or not an array.')
    }

    // STEP 2: Convert JSON update into a Uint8Array
    const update = Uint8Array.from(json.update)

    // STEP 3: Create a new Y.Doc and apply the update
    const newYdoc = new Y.Doc()
    Y.applyUpdate(newYdoc, update)
    window.ydoc = newYdoc

    // STEP 4: Read document content
    const ytext = newYdoc.getText('prosemirror')
    const after = ytext.toString()
    console.log('[Snapshot] Loaded Y.Doc content:', after)

    if (!after || after.trim().length === 0) {
      console.warn('[Snapshot] Document is empty after applying snapshot.')
      alert('Snapshot applied, but document is empty.')
    } else {
      console.log('[Snapshot] Snapshot applied successfully.')
      alert('Snapshot applied. Editor should now be updated.')
    }

    // STEP 5: Rebind the editor if available
    if (window.editor && typeof window.rebindEditorToYdoc === 'function') {
      // Prefer a dedicated rebind function if defined
      window.rebindEditorToYdoc(newYdoc)
      console.log('[Snapshot] Rebound editor to new Y.Doc using rebindEditorToYdoc().')
    } else if (window.editor) {
      // Fallback: forcibly overwrite the content
      const html = window.editor.getHTML()
      window.editor.commands.setContent(html, false)
      console.warn('[Snapshot] Editor was not rebound — fallback content sync used.')
    } else {
      console.warn('[Snapshot] No editor instance found to rebind.')
    }

  } catch (err) {
    console.error('[applySnapshotToYdoc] Failed to apply snapshot:', err)
    alert('Failed to apply snapshot: ' + err.message)
  }
}

