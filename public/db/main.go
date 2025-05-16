package main

import (
	"context"
	"fmt"
	"syscall/js"
	"time"

	"github.com/hack-pad/go-indexeddb/idb"
	. "github.com/stevegt/goadapt"
)

var db *idb.Database

// var ctx = context.Background()

const (
	dbName          = "mydb"
	dbVersion       = 4
	objectStoreName = "mystore"
)

const ctlDivId = "dbctl" // XXX should be more unique

func main() {
	var err error

	defer func() {
		// show a crash messsage
		msg := Spf("Database app crashed: %v", err)
		js.Global().Get("document").Call("getElementById", "db").Set("textContent", msg)
	}()

	// Open the database named "mydb"
	ctx := context.Background()
	req, err := idb.Global().Open(ctx, dbName, dbVersion, createObjectStore)
	Ck(err)
	db, err = req.Await(ctx)
	Ck(err)

	// get db div
	dbdiv := js.Global().Get("document").Call("getElementById", "db")
	dbdiv.Set("textContent", "This is a database app running in your browser, storing keys and values in your browser's IndexedDB database.  This is where we wil store most data -- docs, calendar entries, session description, etc.")
	// Add a div to contain the database UI
	ui := addUiDiv(dbdiv)
	// Add a message area
	// msgdiv := addMessageArea(ui)
	// Add a textarea
	addTextArea(ui)
	// Add buttons
	addAddButton(ui)
	addDumpButton(ui)
	// Add a div to hold the database data dump
	addDumpDiv(ui)

	// replace the "loading" text with a message
	// dbdiv.Set("textContent", "running")

	// wait forever
	select {}
	// <-make(chan bool)

}

func createObjectStore(db *idb.Database, oldVersion, newVersion uint) (err error) {
	options := idb.ObjectStoreOptions{
		KeyPath: js.ValueOf("id"),
	}
	_, err = db.CreateObjectStore(objectStoreName, options)
	Ck(err)
	return nil
}

// add a div to hold the database UI
func addUiDiv(dbdiv js.Value) (div js.Value) {
	// Create a div element
	div = js.Global().Get("document").Call("createElement", "div")
	div.Set("id", ctlDivId)
	dbdiv.Call("appendChild", div)
	return
}

func addTextArea(div js.Value) {
	// Create a textarea element
	textarea := js.Global().Get("document").Call("createElement", "textarea")
	textarea.Set("id", "mytextarea")

	// Add the textarea
	div.Call("appendChild", textarea)
}

func addAddButton(div js.Value) {
	// Create a button element
	button := js.Global().Get("document").Call("createElement", "button")
	button.Set("textContent", "Add key-value pair to the database")

	// Add an event listener to the button
	button.Call("addEventListener", "click", js.FuncOf(onAddPress))

	// Add the button
	div.Call("appendChild", button)
}

func addDumpButton(div js.Value) {
	// Create a button element
	button := js.Global().Get("document").Call("createElement", "button")
	button.Set("textContent", "dump database")

	// Add an event listener to the button
	button.Call("addEventListener", "click", js.FuncOf(onDumpPress))

	// Add the button
	div.Call("appendChild", button)
}

func addDumpDiv(div js.Value) {
	// Create a div element
	dump := js.Global().Get("document").Call("createElement", "div")
	dump.Set("id", "dump")
	// Add the div
	div.Call("appendChild", dump)
}

func onAddPress(this js.Value, args []js.Value) interface{} {
	textAreaValue := js.Global().Get("document").Call("getElementById", "mytextarea").Get("value").String()

	// put the key-value pair in the object store
	obj := map[string]interface{}{"id": time.Now().UnixNano(), "value": textAreaValue}
	jsObj := js.ValueOf(obj)

	// Create a transaction
	txn, err := db.Transaction(idb.TransactionReadWrite, objectStoreName)
	Ck(err)
	store, err := txn.ObjectStore(objectStoreName)
	Ck(err)

	// insert
	_, err = store.Add(jsObj)
	Ck(err)
	/*
		ctx := context.Background()
		err = txn.Await(ctx)
		Ck(err)
	*/
	txn.Commit()

	fmt.Println("New key-value pair added to the database")
	// dumpDatabase()
	return nil
}

func onDumpPress(this js.Value, args []js.Value) interface{} {

	// Create a new request to get all the keys in the database
	txn, err := db.Transaction(idb.TransactionReadOnly, objectStoreName)
	Ck(err)
	store, err := txn.ObjectStore(objectStoreName)
	Ck(err)

	// Create a div element to hold the data
	div := js.Global().Get("document").Call("createElement", "div")
	div.Set("id", "databaseData")
	// Add the div to the dump div, replacing it if it already exists
	dump := js.Global().Get("document").Call("getElementById", "dump")
	if dump.Get("firstChild").Truthy() {
		dump.Call("replaceChild", div, dump.Get("firstChild"))
	} else {
		dump.Call("appendChild", div)
	}

	// Iterate over the result and append each key-value pair to the div
	req, err := store.GetAllKeys()
	Ck(err)
	Pl("req", req)

	ctx, cancel := context.WithCancel(context.Background())
	go func() {
		defer cancel()
		keys, err := req.Await(ctx)
		Ck(err)
		Pl("keys", keys)

		for _, key := range keys {
			// Get the value for the key
			req, err := store.Get(key)
			Ck(err)
			ctx, cancel := context.WithCancel(context.Background())
			key2 := key
			go func() {
				defer cancel()
				value, err := req.Await(ctx)
				Ck(err)
				valueStr := value.Get("value").String()

				// Create a p element to hold the key-value pair
				p := js.Global().Get("document").Call("createElement", "p")
				txt := fmt.Sprintf("Key: %v, Value: %#v", key2.Int(), valueStr)
				p.Set("textContent", txt)
				div.Call("appendChild", p)
			}()
		}
	}()
	return nil
}
