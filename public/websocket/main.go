package main

import (
	"context"
	"fmt"
	"syscall/js"
	"time"

	. "github.com/stevegt/goadapt"
	"nhooyr.io/websocket"
	"nhooyr.io/websocket/wsjson"
)

const (
// url = "ws://localhost:9273/echo" // XXX move to config or env
// url = "ws://echo.websocket.events"
)

func main() {
	fmt.Println("WebSocket client in Go WASM")

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

	url := Spf("%s//%s:%s/echo", protocol, hostname, port)
	Pl("url:", url)

	msg := Spf("This is a simple websocket communicator app running in your browser, talking to %s.", url)
	wsdiv := js.Global().Get("document").Call("getElementById", "websocket")
	wsdiv.Set("textContent", msg)

	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()

	c, _, err := websocket.Dial(ctx, url, nil)
	Ck(err)
	defer c.Close(websocket.StatusInternalError, "websocket closed")

	i := 0
	return // Stops the loop. // YYY

	for {
		i += 1
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
