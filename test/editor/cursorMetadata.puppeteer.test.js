
/**
 * cursorMetadata.puppeteer.test.js
 *
 * Launches two headless browser instances pointing at your local ToyGrid server.
 * Each page sets a different cursor metadata (e.g. “Alice” with color red, “Bob” with color blue)
 * Then verifies that the other page sees the correct metadata.
 */

const puppeteer = require('puppeteer')

// Adjust this to wherever your dev server is running:
const TOYGRID_URL = 'http://localhost:3000'  

// Timeout may need to be increased if your server takes a moment to spin up
jest.setTimeout(30000)

describe('Cursor metadata sync via CollaborationCursor', () => {
  let browserA, browserB, pageA, pageB

  beforeAll(async () => {
    // Launch two separate browser contexts (otherwise they might share sessionStorage)
    browserA = await puppeteer.launch({ headless: true })
    browserB = await puppeteer.launch({ headless: true })

    pageA = await browserA.newPage()
    pageB = await browserB.newPage()

    // Navigate both to the ToyGrid editor
    await Promise.all([
      pageA.goto(TOYGRID_URL),
      pageB.goto(TOYGRID_URL)
    ])

    // Wait for the Yjs/WebSocket connections to establish, if needed:
    await pageA.waitForSelector('#editor') // or some known DOM element
    await pageB.waitForSelector('#editor')
  })

  afterAll(async () => {
    await browserA.close()
    await browserB.close()
  })

  test('should share cursor metadata from A → B and B → A', async () => {
    // 1) In page A: set cursor metadata to { name: "Alice", color: "red" }
    await pageA.evaluate(() => {
      // __toygridCursor is assumed to be the CollaborationCursor instance.
      // If your code uses a different global or internal var, adjust accordingly.
      const cursor = window.toygridCursor  
      cursor.setUserData({ name: 'Alice', color: '#ff0000' })
    })

    // 2) In page B: set cursor metadata to { name: "Bob", color: "blue" }
    await pageB.evaluate(() => {
      const cursor = window.toygridCursor
      cursor.setUserData({ name: 'Bob', color: '#0000ff' })
    })

    // 3) Now wait a moment for the awareness change to propagate:
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 4) On pageB, read all awareness states and confirm that A’s state is present
    const awarenessFromB = await pageB.evaluate(() => {
      const awareness = window._yWebsocketProvider.awareness // adjust to your provider’s API
      const states = Array.from(awareness.getStates().values())
      // states is an array of { clientId, user: { name, color } } or similar
      return states
        .filter(st => st.user && st.user.name)
        .map(st => ({ clientId: st.clientId, user: st.user }))
    })

    // Expect that one of the states has { name: "Alice", color: "#ff0000" }
    const hasAlice = awarenessFromB.some(st => st.user.name === 'Alice' && st.user.color === '#ff0000')
    expect(hasAlice).toBe(true)

    // 5) On pageA, confirm that B’s metadata is present
    const awarenessFromA = await pageA.evaluate(() => {
      const awareness = window._yWebsocketProvider.awareness
      return Array.from(awareness.getStates().values())
        .filter(st => st.user && st.user.name)
        .map(st => ({ clientId: st.clientId, user: st.user }))
    })

    const hasBob = awarenessFromA.some(st => st.user.name === 'Bob' && st.user.color === '#0000ff')
    expect(hasBob).toBe(true)
  })
})
