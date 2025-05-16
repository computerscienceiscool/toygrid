wasm_srcs := $(wildcard public/**/*.go)
wasm_objs := $(subst .go,.wasm,$(wasm_srcs))

tiptap_srcs := $(wildcard editor/build/static/js/*) 

.PHONY: all build clean tiptap version.txt

all: 

build: $(wasm_objs) toygrid # tiptap

%.wasm: %.go
	GOOS=js GOARCH=wasm go build -o $@ $<
	# tinygo build -o $@ -target wasm $<
	# tinygo build -o $@ -target wasm -no-debug $<
	cp `go env GOROOT`/misc/wasm/wasm_exec.js public/wasm_exec.js
	# cp `tinygo env TINYGOROOT`/targets/wasm_exec.js public/wasm_exec.js

tiptap: 
	# set REACT_APP_YJS_WEBSOCKET_SERVER_URL in local/env
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

toygrid: server/server.go server/websocket.go
	cd server && go build -o ../toygrid

version.txt:
	# just use a timestamp for now
	date '+%s' > version.txt

run: 
	killall toygrid || true
	./toygrid ~/lab/cswg/toygrid/public 

run-yjs:
	cd ~/lab/yjs/websocket-server
	PORT=3099 HOST=0.0.0.0 npx y-websocket

deploy: build version.txt
	rsync -e 'ssh -p 27022' -avz --delete ./ europa.d4.t7a.org:~/lab/cswg/toygrid/
	ssh -p 27022 europa.d4.t7a.org 'cd ~/lab/cswg/toygrid && make run' 
