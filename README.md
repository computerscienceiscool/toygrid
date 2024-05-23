# toygrid

Toygrid is a proof-of-concept (PoC) microfrontend project that
demonstrates a decentralized computing platform, with a collaborative
editor and several other simple demo apps. 

TODO
====

- DONE fix tiptap icons 
- improve UI
    - simple demo for use in e.g. a social meetup of how this thing
      might be used in a more formal session.  
      - put a flexbox around each app for visual clarity DONE
      - in order on page: DONE
          - welcome text DONE
          - editor
            - still single-doc for now DONE
      - show other demos after the editor, include a description of
        how each component enables the capabilities of a more
        full-featured session app
        - e.g. describe how db component supports multiple documents
          in the editor
        - goal is to describe the technology well enough for
          others to know what's doable and how to ask for it
- CI/CD  
    - staging, prod servers
- deploy to a stable URL
    - containerize
    - DNS pool
- either convert from yjs to PUP or write a PUP plugin for yjs
    - currently relies on https://github.com/yjs/yjs
    - currently using the centralized y-websocket protocol
    - Yjs can be operated peer-to-peer, but we're not using that
      capability yet, needs to be done
- improve UI more
    - more generic, able to support arbitrary apps without editing the
      HTML
    - desktop metaphor?  other?
- add more demo apps 
    - index of related links e.g. what's shown at
      http://cswg.infrastructures.org/
    - when2meet clone
    - multi-doc editor, with permissions
        - AI assistant
            - helps to maintain context in-doc without having to tab
              away when referencing external or internal URLs and
              other sources
            - if/when we are also handling the audio/video stream, we
              can do context-aware voice recognition and have a auto
              doc moderator during sessions
            - ???
    - chat
    - workshop proposal tool
        - talks to when2meet 
    - calendar
        - talks to when2meet
    - join/membership tool
        - mailing list manager
        - newsletter browser
    - MCP host


