import { WebSocketServer } from "ws";
import { players, status } from "./server.shared.js";
import { broadcast } from "./utils/broadcast.js";
import { addClient } from "./utils/addClient.js";

const argv = process.argv.slice(2);
if (argv.length !== 2)
{
	console.log("Usage: node server.js <player1_name> <player2_name>");
	process.exit(1);
}

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws) => {
	if (Object.values(players).filter(p => p.connected).length >= status.maxPlayers){
		ws.close(1000, "Server full");
		return;
	}

	const player = addClient(ws, argv);
	ws.on("message", (message) => {
		console.log(`Received message from ${player.name}: ${message}`);

		const data = JSON.parse(message);
		if (data.type === "input")
			broadcast(data);
		if (data.type === "getId")
			ws.send(JSON.stringify({id: player.id, type: "getId"}));
		//Server answer
		// ws.send("Message received");
	})

	ws.on("close", () => {
		console.log(`${player.name} disconnected`);
		player.ws = null;
		player.connected = false;
		player.up = false;
		player.down = false;
		if (Object.values(players).filter(p => p.connected).length < status.maxPlayers)
			broadcast({type: "opponentDisconnected"});
		status.allConnected = false;
	})
})

console.log("WebSocket server is running on ws://localhost:8080");
