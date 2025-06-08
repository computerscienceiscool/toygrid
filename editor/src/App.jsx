import './styles.scss'
import { saveSnapshotToOPFS, saveSnapshotAsJSON } from './heliaSnapshot'
// import { applySnapshotToYdoc } from './heliaSnapshot.js'
import { loadSnapshotFromOPFS, applySnapshotToYdoc } from './heliaSnapshot.js'
// import { HocuspocusProvider } from '@hocuspocus/provider'
import CharacterCount from '@tiptap/extension-character-count'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
// import { CollaborationCursor as YjsCollaborationCursor } from 'y-cursors'
import Highlight from '@tiptap/extension-highlight'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React, {
  useCallback, useEffect,
  useState,
} from 'react'

import { retrieveAndApplyUpdates } from './helia' // import retrieveAndApplyUpdates from './helia'
import {initHelia } from './helia' // import Helia from 'helia'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

import { IndexeddbPersistence } from 'y-indexeddb'
import MenuBar from './MenuBar'
window.saveSnapshotToOPFS = saveSnapshotToOPFS
window.saveSnapshotAsJSON = saveSnapshotAsJSON

window.loadSnapshotToYdoc = async () => {
  const json = await loadSnapshotFromOPFS()
  if (json) {
    applySnapshotToYdoc(json, ydoc)
  }
}



const colors = ['#958DF1', '#F98181', '#FBBC88', '#FAF594', '#70CFF8', '#94FADB', '#B9F18D']
// const rooms = ['rooms.50', 'rooms.51', 'rooms.52']
const names = [
  'Lea Thompson',
  'Cyndi Lauper',
  'Tom Cruise',
  'Madonna',
  'Jerry Hall',
  'Joan Collins',
  'Winona Ryder',
  'Christina Applegate',
  'Alyssa Milano',
  'Molly Ringwald',
  'Ally Sheedy',
  'Debbie Harry',
  'Olivia Newton-John',
  'Elton John',
  'Michael J. Fox',
  'Axl Rose',
  'Emilio Estevez',
  'Ralph Macchio',
  'Rob Lowe',
  'Jennifer Grey',
  'Mickey Rourke',
  'John Cusack',
  'Matthew Broderick',
  'Justine Bateman',
  'Lisa Bonet',
]

const getRandomElement = list => list[Math.floor(Math.random() * list.length)]

// const getRandomRoom = () => getRandomElement(rooms)
const getRandomColor = () => getRandomElement(colors)
const getRandomName = () => getRandomElement(names)

// const room = getRandomRoom()
const room = 'cswg'
// FOR TESTING ONLY: placeholder group hash for Helia namespace
// 
const placeholderGroupHash = 'TEST_GROUP_HASH'


const ydoc = new Y.Doc()
//const websocketUrl = process.env.REACT_APP_YJS_WEBSOCKET_SERVER_URL || 'ws:europa.d4.t7a.org:3000'  // Europa server
// const websocketUrl = process.env.REACT_APP_YJS_WEBSOCKET_SERVER_URL || 'ws://localhost:3099'
const websocketUrl = process.env.REACT_APP_YJS_WEBSOCKET_SERVER_URL || 'ws://127.0.0.1:3099'  // testing This ensures the browser connects explicitly over IPv4 to 127.0.0.1, avoiding any IPv6/hostname resolution quirks.


const websocketProvider = new WebsocketProvider(websocketUrl, 'cswg-demo', ydoc)
// window.toygridCursor = new CollaborationCursor(websocketProvider.awareness);
window._yWebsocketProvider = websocketProvider
window._toygridAwareness = websocketProvider.awareness

const indexeddbProvider = new IndexeddbPersistence('cswg-demo', ydoc)

indexeddbProvider.once('synced', () => { 
  console.log('[IndexedDB] Document loaded from IndexedDB')
})

window.websocketProvider = websocketProvider
window.ydoc = ydoc  // Expose Yjs doc for debugging

// Expose IndexedDB provider for debugging
window.applySnapshotToYdoc = (json, ydoc) => {
  try {
    if (!json || !Array.isArray(json.update)) {
      throw new Error('Invalid snapshot format: "update" field missing or not an array.')
    }

    const update = Uint8Array.from(json.update)

    if (!(ydoc instanceof Y.Doc)) {
      throw new Error('Target ydoc is not a valid Y.Doc instance.')
    }

    Y.applyUpdate(ydoc, update)
    console.log('[applySnapshotToYdoc] Snapshot applied successfully.')
  } catch (err) {
    console.error('[applySnapshotToYdoc] Failed to apply snapshot:', err)
    alert('Failed to apply snapshot: ' + err.message)
  }
}



/*
const websocketProvider = new HocuspocusProvider({
  url: 'wss://connect.hocuspocus.cloud',
  parameters: {
    key: 'write_bqgvQ3Zwl34V4Nxt43zR',
  },
  name: room,
  document: ydoc,
})
*/

// on europa:
// cd ~/lab/yjs/websocket-server; PORT=3099 HOST=0.0.0.0 npx y-websocket
// define an env var YJS_WEBSOCKET_SERVER_URL
//
const getInitialUser = () => {
  return JSON.parse(localStorage.getItem('currentUser')) || {
    name: getRandomName(),
    color: getRandomColor(),
  }
}

const App = () => {
  const [heliaNode, setHeliaNode] = useState(null)  // Helia node for IPFS
  const [status, setStatus] = useState('connecting')
  const [currentUser, setCurrentUser] = useState(getInitialUser())
  // Whenever local awareness “user” changes, copy it into React state:
  useEffect(() => {
    const onAwarenessChange = () => {
      const local = window._toygridAwareness.getLocalState()
      if (local?.user && local.user.name !== currentUser.name) {
        setCurrentUser({ name: local.user.name, color: local.user.color })
      }
    }

    window._toygridAwareness.on('change', onAwarenessChange)
    return () => {
      window._toygridAwareness.off('change', onAwarenessChange)
    }
  }, [currentUser])
  
//  const [currentUser, setCurrentUser] = useState(getInitialUser)
  console.log("[App] Component is rendering");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false,
      }),
      Highlight,
      TaskList,
      TaskItem,
      CharacterCount.configure({
        limit: 10000,
      }),
      Collaboration.configure({
        document: ydoc,
        field: 'prosemirror', 
      }),
      CollaborationCursor.configure({
        provider: websocketProvider,
      }),
    ],
  })


   // Initialize Helia on component mount
   useEffect(() => {
     initHelia(placeholderGroupHash)
       .then(async node => {
         setHeliaNode(node)
        // Listen for Yjs document updates and store them in Helia
        // NEW: Load previous updates from Helia
     await retrieveAndApplyUpdates(node, ydoc, placeholderGroupHash)

      // Then listen for and store new updates
     ydoc.on('update', async update => {
        try {
          const cid = await node.blockstore.put(update)
          localStorage.setItem(placeholderGroupHash, cid.toString())
          console.log('Stored update in Helia with CID:', cid.toString())
        } catch (e) {
          console.error('Failed to store update in Helia:', e)
        }
      })
    })
    .catch(err => {
      console.error('Helia initialization failed:', err)
    })
}, [])

  useEffect(() => {
    // Update status changes
    websocketProvider.on('status', event => {
      setStatus(event.status)
        if (event.status === 'connected') {
            console.log('[WebSocket] Connected')
        } else if (event.status === 'disconnected') {
            console.log('[WebSocket] Disconnected - will attempt to reconnect')
        }
    })
  }, [])

const [wasDisconnected, setWasDisconnected] = useState(false)

  useEffect(() => {
    let timeout
    websocketProvider.on('status', event => {
      setStatus(event.status)
      if (event.status === 'connected') {
        console.log('[WebSocket] Connected')
        setWasDisconnected(false)
        clearTimeout(timeout)
      } else if (event.status === 'disconnected') {
        console.log('[WebSocket] Disconnected - will attempt to reconnect')
        timeout = setTimeout(() => {
          setWasDisconnected(true)
        }, 5000)
      }
    })

  return () => clearTimeout(timeout)
}, [])
  

  // Save current user to localStorage and emit to editor 
  // Whenever currentUser changes, persist + update editor + awareness:
  useEffect(() => {
    if (editor && currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser))
      editor.chain().focus().updateUser(currentUser).run()
      // Write React’s currentUser into awareness
      websocketProvider.awareness.setLocalStateField('user', {
        name: currentUser.name,
        color: currentUser.color,
      })
     }
   }, [editor, currentUser])
    
const setName = useCallback(() => {
  const name = (window.prompt('Name') || '').trim().substring(0, 32)

  if (name) {
    setCurrentUser({ ...currentUser, name })
  }
}, [currentUser])


  return (
    <>
    <div style={{ padding: '8px', background: '#f5f5f5', fontStyle: 'italic' }}>
      {heliaNode ? 'Helia is initialized' : 'Initializing Helia…'}
    </div>
    {wasDisconnected && (
      <div style={{ backgroundColor: '#ffe0e0', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>
        WebSocket has been disconnected for over 5 seconds.
        Changes may not sync until reconnected.
      </div>
    )}
    <div className="editor">
      {editor && <MenuBar editor={editor} />}
      <EditorContent className="editor__content" editor={editor} />
      <div className="editor__footer">
          <div className={`editor__status editor__status--${status}`}>
            {status === 'connected' && (
               `${editor.storage.collaborationCursor.users.length} user${editor.storage.collaborationCursor.users.length === 1 ? '' : 's'} online in ${room}`)
            }
            {status === 'connecting' && 'Connecting to server...'}
            {status === 'disconnected' && 'Disconnected from server. Reconnecting...'}
          </div>
          <div className="editor__name">
            <button onClick={setName}>{currentUser.name}</button>
          </div>
        </div>
    </div>
    </>
  )
}

export default App; 
