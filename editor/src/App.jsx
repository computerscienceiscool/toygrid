
import './styles.scss'

// import { HocuspocusProvider } from '@hocuspocus/provider'
import CharacterCount from '@tiptap/extension-character-count'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import Highlight from '@tiptap/extension-highlight'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React, {
  useCallback, useEffect,
  useState,
} from 'react'

import {initHelia } from './helia' // import Helia from 'helia'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

import { IndexeddbPersistence } from 'y-indexeddb'
import MenuBar from './MenuBar'


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
const websocketUrl = process.env.REACT_APP_YJS_WEBSOCKET_SERVER_URL || 'ws:europa.d4.t7a.org:3000'  // changed

const websocketProvider = new WebsocketProvider(websocketUrl, 'cswg-demo', ydoc)
const indexeddbProvider = new IndexeddbPersistence('cswg-demo', ydoc)

indexeddbProvider.once('synced', () => { 
  console.log('[IndexedDB] Document loaded from IndexedDB')
})

window.websocketProvider = websocketProvider
window.ydoc = ydoc  // Expose Yjs doc for debugging

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
  const [currentUser, setCurrentUser] = useState(getInitialUser)

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
      }),
      CollaborationCursor.configure({
        provider: websocketProvider,
      }),
    ],
  })
   // Initialize Helia on component mount
   useEffect(() => {
     initHelia(placeholderGroupHash)
       .then(node => {
         setHeliaNode(node)
        // Listen for Yjs document updates and store them in Helia
        ydoc.on('update', async update => {
          try {
            const cid = await node.blockstore.put(update);
            // Store the latest CID under our test hash
            localStorage.setItem(placeholderGroupHash, cid.toString());
            console.log('Stored update in Helia with CID:', cid.toString());
          } catch (e) {
            console.error('Failed to store update in Helia:', e);
          }
        });

       })
       .catch(err => {
         console.error('Helia initialization failed:', err)
       })
  }, [])

  useEffect(() => {
    // Update status changes
    websocketProvider.on('status', event => {
      setStatus(event.status)
    })
  }, [])

  // Save current user to localStorage and emit to editor 
  useEffect(() => {
    if (editor && currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser))
      editor.chain().focus().updateUser(currentUser).run()
    }
  }, [editor, currentUser])
    
    // This helps track the awareness 
    useEffect(() => {
    if (editor && currentUser) {
        localStorage.setItem('currentUser', JSON.stringify(currentUser))
        editor.chain().focus().updateUser(currentUser).run()

        // Explicitly set awareness state
        websocketProvider.awareness.setLocalStateField('user', {
        name: currentUser.name,
        color: currentUser.color,
        })
    }
    }, [editor, currentUser])
    

  const setName = useCallback(() => {
    const name = (window.prompt('Name') || '').trim().substring(0, 32)

    if (name) {
      return setCurrentUser({ ...currentUser, name })
    }
  }, [currentUser])

  return (
    <>
    <div style={{ padding: '8px', background: '#f5f5f5', fontStyle: 'italic' }}>
      {heliaNode ? 'Helia is initialized' : 'Initializing Helia…'}
    </div>
    <div className="editor">
      {editor && <MenuBar editor={editor} />}
      <EditorContent className="editor__content" editor={editor} />
      <div className="editor__footer">
          <div className={`editor__status editor__status--${status}`}>
            {status === 'connected'
              ? `${editor.storage.collaborationCursor.users.length} user${editor.storage.collaborationCursor.users.length === 1 ? '' : 's'} online in ${room}`
              : 'offline'}
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
