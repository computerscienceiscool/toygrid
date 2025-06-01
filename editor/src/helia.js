
// File: editor/src/helia.js
// Initializes a Helia node in the browser and exports a function to get it.

import { createHelia } from 'helia';
import * as Y from 'yjs'

let heliaNode = null; // Will hold the single Helia instance


// Retrieve and apply updates from pinned blocks in a namespace
export async function retrieveAndApplyUpdates(helia, ydoc, namespace) {
  try {
      if (!helia.pin || typeof helia.pin.ls !== 'function') {
        
          console.error('helia.pin.ls is not available. helia.pin:', helia.pin);
        return;
      }

      for await (const { cid } of helia.pin.ls({ namespace })) {
      const block = await helia.blockstore.get(cid)
      Y.applyUpdate(ydoc, block)
      console.log('Applied update from CID:', cid.toString())
    }
  } catch (e) {
    console.error('Error retrieving updates from Helia:', e)
  }
}





/**
 * initHelia()
 * - On first call, creates and stores a Helia node instance.
 * - On subsequent calls, returns the already-created instance.
 *
 * Returns a Promise<Helia> so you can `await` it in your React components.
 */
export async function initHelia(groupHash) {
  console.log('initHelia called with groupHash:', groupHash); // Log the groupHash for debugging  
  if (heliaNode) {
    console.log('Returning existing Helia node:', heliaNode);
    return heliaNode;
  }
  // createHelia() automatically picks the right transport (WebAssembly in the browser)
  heliaNode = await createHelia();
  console.log('Helia node initialized:', heliaNode);
  return heliaNode;
}
