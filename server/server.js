import { WebSocketServer } from "ws";
import { matches } from "./server.shared.js";
import { broadcast } from "./utils/broadcast.js";
import { createMatch, removeMatch } from "./creates/createMatch.js";
import { handleTypes } from "./handleMessages/handleTypes.js";


//Matches de template para testes apagar futuramente
createMatch({
	// id: 1,
	players: {
		1: {id: 4002, name: "Raltz"},
		2: {id: 8922, name: "Kirlia"}
	},
})

createMatch({
	// id: 2,
	type: "newMatch",
	players: {
		1: {id: 314, name: "Pikachu"},
		2: {id: 271, name: "Eevee"}
	}
})

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws) => {
	ws.player = null;
	ws.on("message", (message) => {
		const data = JSON.parse(message);
		
		if (ws.player) console.log(`Received message from ${ws.player.name}: ${data}`);

		handleTypes(ws.player, data, ws);
	})

	ws.on("error", (error) => {
		console.error("WebSocket error:", error);
	});

	ws.on("close", () => {
		console.log("Connection closed");

		const match = Object.values(matches).find(m => m && Object.values(m.players).some(p => p.ws === ws));
		if (!match) return;
		const player = Object.values(match.players).find(p => p.ws === ws);
		if (!player) return;
		const key = Object.keys(matches).find(i => matches[i] && matches[i].id === match.id);

		console.log(`Player ${player.name} disconnected from match ${match.id}`);
		player.connected = false;
		player.ws = null;

		broadcast({type: "opponentConnection", connected: false}, key);
		match.allConnected = false;

		if (match.gameStarted && !match.gameEnded && Object.values(match.players).every(p => !p.connected)) {
			console.log(`All players disconnected, removing match ${match.id}`);
			removeMatch(key, true);
			//Notify matchMaking after this
		}
	})
});

console.log("WebSocket server is running on ws://localhost:8080");
console.log(`got matches: ${Object.keys(matches)}`);
