
// File: editor/src/helia.js
// Initializes a Helia node in the browser and exports a function to get it.

import { createHelia } from 'helia';

let heliaNode = null; // Will hold the single Helia instance

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
