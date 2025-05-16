package main

import (
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func echo(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("upgrade:", err)
		return
	}
	defer conn.Close()

	for {
		messageType, message, err := conn.ReadMessage()
		if err != nil {
			log.Println("read:", err)
			break
		}
		log.Printf("recv: %s", message)

		err = conn.WriteMessage(messageType, message)
		if err != nil {
			log.Println("write:", err)
			break
		}
	}
}

var clients = struct {
	sync.RWMutex
	list map[*websocket.Conn]bool
}{
	list: make(map[*websocket.Conn]bool),
}

func addClient(conn *websocket.Conn) {
	clients.Lock()
	defer clients.Unlock()
	clients.list[conn] = true
}

func removeClient(conn *websocket.Conn) {
	clients.Lock()
	defer clients.Unlock()
	delete(clients.list, conn)
}

func broadcast(messageType int, message []byte) {
	clients.RLock()
	defer clients.RUnlock()
	for conn := range clients.list {
		err := conn.WriteMessage(messageType, message)
		if err != nil {
			log.Printf("Error broadcasting message: %v", err)
			removeClient(conn)
		}
	}
}

func broadcaster(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("upgrade:", err)
		return
	}
	defer conn.Close()

	addClient(conn)

	for {
		messageType, message, err := conn.ReadMessage()
		if err != nil {
			log.Println("read:", err)
			removeClient(conn)
			break
		}
		broadcast(messageType, message)
	}
}
