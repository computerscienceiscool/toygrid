wasm_srcs := $(wildcard public/**/*.go)
wasm_objs := $(subst .go,.wasm,$(wasm_srcs))

tiptap_srcs := $(wildcard editor/build/static/js/*) 

.PHONY: all build clean tiptap version.txt

all: 
	@echo say "'make start'" or "'make stop'"

# starts Yjs and the toygrid http/websocket Go server
start: stop start-yjs start-toygrid status

stop: stop-toygrid stop-yjs

stop-yjs:
	kill $$(lsof -i :3099 | awk '{print $$2}' | tail -1) || true

# start the Yjs websocket server.  this will fail if it's already running.
start-yjs:
	cd ~/lab/yjs/websocket-server && PORT=3099 HOST=0.0.0.0 npx y-websocket &

status:
	# XXX we can show status here but would want to turn port numbers etc. into variables first

# build WASM modules, http/websocket server Go code, # not tiptap static site
build: $(wasm_objs) toygrid # tiptap

# wildcard rule to build all the WASM modules from $(wasm_objs)
%.wasm: %.go
	# build WASM module
	GOOS=js GOARCH=wasm go build -o $@ $<
	# tinygo build -o $@ -target wasm $<
	# tinygo build -o $@ -target wasm -no-debug $<
	#
	# copy the VERSION SPECIFIC THIS IS STUPID javascript shim from the
	# version of go that was used to compile the WASM module above.  
	# THIS IS STILL STUPID and Steve has a proposal he never submitted to fix this.
	# For PromiseGrid, we will need to maintain our own equivalent,
	# version-agnostic, wasm_exec.js becasue Steve got distracted.  Or else
	# we finish and push that proposal through the Go dev pipeline.
	cp `go env GOROOT`/misc/wasm/wasm_exec.js public/wasm_exec.js
	# cp `tinygo env TINYGOROOT`/targets/wasm_exec.js public/wasm_exec.js

# Build the static site.  This is what gets served by the http/websocket server
# when you say `make run`.  Here, we pre-build some stuff that the tiptap npm
# start would normally do, but we don't start the HTTP server that npm start
# would normally do, because we have our own HTTP server that we start with the
# start-toygrid stanza below.
#
# Note that you need to have REACT_APP_YJS_WEBSOCKET_SERVER_URL set correctly in local/env, e.g.:
# export REACT_APP_YJS_WEBSOCKET_SERVER_URL=ws://europa.d4.t7a.org:3099
tiptap: 
	@echo you may need to set/change local/env -- right now it says
	cat local/env
	cd editor && npm install
	. local/env && cd editor && npm run build
	# XXX this is messy -- all editor stuff should instead land in public/editor
	cp editor/build/static/js/main.*.js public/editor/main.js
	cp editor/build/static/css/main.*.css public/style.css
	mkdir -p public/editor/static
	rsync -av editor/build/static/ public/static/

clean:
	rm -f $(wasm_objs)
	# XXX clean out editor stuff

# build the http/websocket binary.  This is what gets served by the http/websocket server
# when you say `make run`.
toygrid: server/server.go server/websocket.go
	cd server && go build -o ../toygrid

# This needs to be run any time we change the site.  A new version number will
# cause any open browser tabs to automatically reload.  Maybe.
version.txt:
	# just use a timestamp for now
	date '+%s' > version.txt

stop-toygrid:
	# kill it if it's already running, otherwise continue
	killall toygrid || true

# This starts the http/websocket server that is written in go
start-toygrid: stop-toygrid
	# start the toygrid http and websocket server that is written in Go
	./toygrid ~/lab/cswg/toygrid/public &

# DO NOT RUN THIS.  Steve used it to let him develop on his laptop and ship
# things to europa without going through git because he was lazy.  We can adapt
# this for you later.  We're prefixing it with XXX for safety for now.
XXXdeploy: build version.txt
	rsync -e 'ssh -p 27022' -avz --delete ./ europa.d4.t7a.org:~/lab/cswg/toygrid/
	ssh -p 27022 europa.d4.t7a.org 'cd ~/lab/cswg/toygrid && make run' 
