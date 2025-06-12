import './MenuBar.scss'

import React, { Fragment } from 'react'
import { applySnapshotToYdoc } from './heliaSnapshot'
import MenuItem from './MenuItem'

const menuBar = ({ editor }) => {
  const items = [
   
   {
      icon: 'save-3-line',
      title: 'Save Snapshot',
      action: async () => {
        try {
          const filename = await window.saveSnapshotToOPFS(window.ydoc)
          const timestamp = new Date().toLocaleTimeString()
          alert(`Snapshot saved at ${timestamp} as ${filename}`)
        } catch (err) {
          alert('Failed to save snapshot.')
        }
      },
    },
    {
      type: 'divider',
    },
   {
      icon: 'file-2-line',
      title: 'Save Snapshot (JSON)',
      action: async () => {
         try {
          const filename = await window.saveSnapshotAsJSON(window.ydoc)
          const timestamp = new Date().toLocaleTimeString()
          alert(`JSON snapshot saved at ${timestamp} as ${filename}`)
         } catch (err) {
          alert('Failed to save JSON snapshot.')
        }
      },
    },
     
{
  icon: 'folder-open-line',
  title: 'Load Snapshot',
  action: async () => {
    try {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'application/json'

      input.onchange = async () => {
        const file = input.files[0]
        if (!file) return

        const text = await file.text()
        const json = JSON.parse(text)
        
        applySnapshotToYdoc(json, window.ydoc)

       /* const Y = await import('yjs')
        const update = Uint8Array.from(json.update)     


        // Reuse the existing ydoc instead of replacing it
        if (window.ydoc) {
          Y.applyUpdate(window.ydoc, update)
          alert('Snapshot loaded successfully.')
        } else {
          alert('Yjs document not initialized.')
        }*/
      }

      input.click()
    } catch (err) {
      console.error(err)
      alert('Failed to load snapshot.')
    }
  },
},

{
  icon: 'eye-line',
  title: 'Show Current Snapshot',
  action: async () => {
    try {
      const snapshot = window.ydoc.toJSON();
      const pretty = JSON.stringify(snapshot, null, 2);
      alert('Current Snapshot:\n' + pretty.substring(0, 1000) + (pretty.length > 1000 ? '...\n\n(Truncated)' : ''));
      console.log('[Snapshot JSON]', snapshot);
    } catch (err) {
      alert('Could not read Y.Doc snapshot.');
      console.error('Error reading ydoc snapshot:', err);
    }
  },
},

    {
      icon: 'bold',
      title: 'Bold',
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: () => editor.isActive('bold'),
    },
    {
      icon: 'italic',
      title: 'Italic',
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: () => editor.isActive('italic'),
    },
    {
      icon: 'strikethrough',
      title: 'Strike',
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: () => editor.isActive('strike'),
    },
    {
      icon: 'code-view',
      title: 'Code',
      action: () => editor.chain().focus().toggleCode().run(),
      isActive: () => editor.isActive('code'),
    },
    {
      icon: 'mark-pen-line',
      title: 'Highlight',
      action: () => editor.chain().focus().toggleHighlight().run(),
      isActive: () => editor.isActive('highlight'),
    },
    {
      type: 'divider',
    },
    {
      icon: 'h-1',
      title: 'Heading 1',
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: () => editor.isActive('heading', { level: 1 }),
    },
    {
      icon: 'h-2',
      title: 'Heading 2',
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: () => editor.isActive('heading', { level: 2 }),
    },
    {
      icon: 'paragraph',
      title: 'Paragraph',
      action: () => editor.chain().focus().setParagraph().run(),
      isActive: () => editor.isActive('paragraph'),
    },
    {
      icon: 'list-unordered',
      title: 'Bullet List',
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: () => editor.isActive('bulletList'),
    },
    {
      icon: 'list-ordered',
      title: 'Ordered List',
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: () => editor.isActive('orderedList'),
    },
    {
      icon: 'list-check-2',
      title: 'Task List',
      action: () => editor.chain().focus().toggleTaskList().run(),
      isActive: () => editor.isActive('taskList'),
    },
    {
      icon: 'code-box-line',
      title: 'Code Block',
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: () => editor.isActive('codeBlock'),
    },
    {
      type: 'divider',
    },
    {
      icon: 'double-quotes-l',
      title: 'Blockquote',
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: () => editor.isActive('blockquote'),
    },
    {
      icon: 'separator',
      title: 'Horizontal Rule',
      action: () => editor.chain().focus().setHorizontalRule().run(),
    },
    {
      type: 'divider',
    },
    {
      icon: 'text-wrap',
      title: 'Hard Break',
      action: () => editor.chain().focus().setHardBreak().run(),
    },
    {
      icon: 'format-clear',
      title: 'Clear Format',
      action: () => editor.chain().focus().clearNodes().unsetAllMarks()
        .run(),
    },
    {
      type: 'divider',
    },
    {
      icon: 'arrow-go-back-line',
      title: 'Undo',
      action: () => editor.chain().focus().undo().run(),
    },
    {
      icon: 'arrow-go-forward-line',
      title: 'Redo',
      action: () => editor.chain().focus().redo().run(),
    },
  ]

  return (
    <div className="editor__header">
      {items.map((item, index) => (
        <Fragment key={index}>
          {item.type === 'divider' ? <div className="divider" /> : <MenuItem {...item} />}
        </Fragment>
      ))}
    </div>
  )
}

export default menuBar;
