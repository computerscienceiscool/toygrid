package main

import (
	"context"
	"syscall/js"
	"time"

	"nhooyr.io/websocket"

	. "github.com/stevegt/goadapt"
)

// a WASM component that acts as a decentralized chat client by
// combining public/db/main.go and public/websocket/main.go. store
// each chat message in the local indexeddb and then send it to the
// other clients via the /broadcast endpoint on the websocket server.
// use UTC timestamp as the database key.  when a client connects, it
// sends an "ihave" message containing node ID and the most recent key
// in its database.  when receiving an "ihave" message, respond with
// another "ihave" only if the local database contains a more recent
// key.  if the local database has an older most recent key, send a
// "sendme" message addressed to the node with a more recent key,
// containing the most recent local key.  when receiving a "sendme"
// message addressed to the local node, respond by sending all
// messages between the old key in the message and the most recent key
// in the local database, inclusive. when receiving a message, add  it
// to the database if it is not already there.

func main() {
	Pl("WebSocket/db chat client in Go WASM")

	// get server URL from javascript
	window := js.Global()

	// Access window.location property
	location := window.Get("location")

	// Access the properties of the location object
	href := location.Get("href").String()
	protocol := location.Get("protocol").String()
	host := location.Get("host").String()
	hostname := location.Get("hostname").String()
	port := location.Get("port").String()
	pathname := location.Get("pathname").String()
	search := location.Get("search").String()
	hash := location.Get("hash").String()

	Pf("Href: %s\nProtocol: %s\nHost: %s\nHostname: %s\nPort: %s\nPathname: %s\nSearch: %s\nHash: %s\n",
		href, protocol, host, hostname, port, pathname, search, hash)

	url := Spf("%s//%s:%s/broadcast", protocol, hostname, port)
	Pl("url:", url)

	msg := Spf("This is a websocket chat app running in your browser, storing messages in IndexedDB, talking to other browsers via%s.", url)
	wsdiv := js.Global().Get("document").Call("getElementById", "chat")
	wsdiv.Set("textContent", msg)

	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()

	c, _, err := websocket.Dial(ctx, url, nil)
	Ck(err)
	defer c.Close(websocket.StatusInternalError, "websocket closed")

	// XXX draw UI

	// XXX start sender

	// XXX start receiver

	select {}
}

// Message is a type for all messages, including incoming and outgoing
// texts and control.
type Message struct {
	// Type is the type of message, such as "text", "ihave", or "sendme".
	Type string `json:"type"`
	// From is the node ID of the sender.
	From string `json:"from"`
	// To is the node ID of the recipient.
	To string `json:"to"`
	// Time is UTC timestamp, with nanosecond precision, of the message.
	// - if type is text, then this is the database key
	// - if type is ihave, then this is the time of the most recent
	//   message in the sender's database
	Time time.Time `json:"time"`
	// Text is the text of the message.
	Text string `json:"text"`
}

// onMessage processes incoming messages.
func onMessage(msg Message) {
	// switch on message type
	switch msg.Type {
	case "text":
		// store message in local database if it's not already there
		// XXX
	case "ihave":
		// if local database has a more recent key, send "ihave"
		// XXX
	case "sendme":
		// when receiving a "sendme" message addressed to the
		// local node, respond by sending all messages between the
		// old key in the message and the most recent key in the
		// local database, inclusive.
		// XXX
	default:
		// XXX
	}
}

// 5. Write a function to store incoming chat messages in the local IndexedDB using the UTC timestamp as the database key.
// 6. Modify the WebSocket code to trigger the appropriate functions when a message is received from another client.
// 7. Register the new Go file for compiling to WASM and import the appropriate JS functions for use in the client-side application.

/*
	for {

		ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
		defer cancel()

		// Send a message to the server
		sendMsg := Spf("Hello from Go WASM %v", i)
		err = wsjson.Write(ctx, c, sendMsg)
		if err != nil {
			fmt.Println("Failed to send message:", err)
			time.Sleep(1 * time.Second)
			continue
		}
		// Receive a message from the server
		var recvMsg string
		err = wsjson.Read(ctx, c, &recvMsg)
		if err != nil {
			fmt.Println("Failed to receive message:", err)
			time.Sleep(1 * time.Second)
			continue
		}
		fmt.Println("Received message:", recvMsg)
		// sleep for 10 seconds
		time.Sleep(time.Second)
	}

	// c.Close(websocket.StatusNormalClosure, "")
}
*/
