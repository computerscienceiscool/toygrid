
// test/editor/checkCursor.js

const puppeteer = require('puppeteer');

(async () => {
  const TOYGRID_URL = 'http://localhost:3000';
  let browserA, browserB, pageA, pageB;

  try {
    browserA = await puppeteer.launch({ headless: true });
    browserB = await puppeteer.launch({ headless: true });

    pageA = await browserA.newPage();
    pageB = await browserB.newPage();

    // Navigate to the editor in both pages
    await Promise.all([pageA.goto(TOYGRID_URL), pageB.goto(TOYGRID_URL)]);

    // Wait until the editor UI is ready
    await pageA.waitForSelector('#editor', { timeout: 10000 });
    await pageB.waitForSelector('#editor', { timeout: 10000 });

    // In page A: set metadata
    await pageA.evaluate(() => {
      if (!window.toygridCursor) {
        throw new Error('Cursor not found on page A');
      }
      window.toygridCursor.setUserData({ name: 'Alice', color: '#ff0000' });
    });

    // In page B: set metadata
    await pageB.evaluate(() => {
      if (!window.toygridCursor) {
        throw new Error('Cursor not found on page B');
      }
      window.toygridCursor.setUserData({ name: 'Bob', color: '#0000ff' });
    });

    // Give awareness a moment to sync
    await new Promise(r => setTimeout(r, 1000));

    // Check that page B sees Alice
    const statesOnB = await pageB.evaluate(() =>
      Array.from(window._yWebsocketProvider.awareness.getStates().values())
    );
    const sawAlice = statesOnB.some(st => st.user?.name === 'Alice');

    if (!sawAlice) {
      console.error('Page B did NOT see Alice’s metadata');
      process.exit(1);
    }

    // Check that page A sees Bob
    const statesOnA = await pageA.evaluate(() =>
      Array.from(window._yWebsocketProvider.awareness.getStates().values())
    );
    const sawBob = statesOnA.some(st => st.user?.name === 'Bob');

    if (!sawBob) {
      console.error('Page A did NOT see Bob’s metadata');
      process.exit(1);
    }

    console.log('Both clients saw each other’s cursor metadata');
    process.exit(0);
  } catch (err) {
    console.error('Error during check:', err);
    process.exit(1);
  } finally {
    if (browserA) await browserA.close();
    if (browserB) await browserB.close();
  }
})();
