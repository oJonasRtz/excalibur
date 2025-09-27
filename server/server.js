import { WebSocketServer } from "ws";
import { maxPlayers, players } from "./server.shared.js";
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
	if (players.length === maxPlayers) {
		ws.close(1000, "Server full");
		return;
	}

	const player = addClient(ws, argv[players.length + 1 & 1]);
	ws.on("message", (message) => {
		console.log(`Received message from ${player.name}: ${message}`);

		//Server answer
		// ws.send("Message received");
	})

	ws.on("close", () => {
		console.log(`${player.name} disconnected`);
		broadcast(`${player.name} disconnected`);
		players.splice(players.indexOf(player), 1);
		if (players.length < maxPlayers)
			broadcast(JSON.stringify({type: "opponentDisconnected"}));
	})
})

console.log("WebSocket server is running on ws://localhost:8080");
