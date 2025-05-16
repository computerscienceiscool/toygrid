package main

// XXX move apps to ./app/*, rename this file to main.go, fix Makefile

import (
	"io/ioutil"
	"log"
	"net/http"
	"os"

	. "github.com/stevegt/goadapt"
)

const port = 9073

func main() {
	dir := os.Args[1]

	// create file server handler
	path := http.Dir(dir)

	fs := http.FileServer(path)

	http.HandleFunc("/version", version)
	http.HandleFunc("/broadcast", broadcaster)
	http.HandleFunc("/echo", echo)
	http.Handle("/", fs)

	Pf("Serving files from %v on port %v\n", path, port)
	log.Fatal(http.ListenAndServe(Spf(":%v", port), nil))
}

// version returns the version of the SPA.  it is to be used by the client to
// determine if it needs to refresh its cache.
func version(w http.ResponseWriter, r *http.Request) {
	// read version from ./version
	version, err := ioutil.ReadFile("./version.txt")
	if err != nil {
		version = []byte("unknown")
	}

	// return version to the client with caching disabled
	w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
	w.Write(version)
}
