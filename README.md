# toygrid

Toygrid is a proof-of-concept (PoC) microfrontend project that
demonstrates a decentralized computing platform, with a collaborative
editor and several other simple demo apps. 

# Overview

This file describes starting and managing either just plain tiptap editor or
the full toygrid system which includes tiptap and several WASM demos.  Both of
these systems use Yjs as a backend keystroke sync server for the tiptap editor,
so there is some overlap.

The Yjs server we're using runs as a websocket server, so you'll see something
like yjs and websocket in the name in process listings and config items.  

## Just plain Tiptap

There is a plain tiptap system set up in
https://github.com/stevegt/collaborative-editor.  Steve did some customization
of toolbar items for fonts etc. as well as adding the Yjs config, so actually
this is not "plain" tiptap but "plain tiptap plus toolbar and Yjs".

The Yjs config is what lets us do multi-cursor collaboritive editing.  

See the README.md in https://github.com/stevegt/collaborative-editor for
details of starting and stopping.

## Toygrid

Toygrid is tiptap, some WASM demos, Yjs, and a separate websocket server for the WASM demos.

Because the Yjs server uses websocket as its transport, and then we're running
a separate websocket server for the WASM demos, there are actually two
websocket servers.  This can cause confusion.

Note that both Yjs and the WASM websocket server are supposed to go away, to be
replaced with grid-based agents serving the same purposes.

Toygrid uses a sort of microfrontend philosophy.  Maybe.  https://micro-frontends.org/


### Starting toygrid

```
cd ~/lab/cswg/toygrid
make start
```


### Stopping toygrid


```
cd ~/lab/cswg/toygrid
make stop
```

 

