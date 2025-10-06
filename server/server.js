import { WebSocketServer } from "ws";
import { backend, matches } from "./server.shared.js";
import { broadcast } from "./utils/broadcast.js";
import { addClient } from "./utils/addClient.js";

let matchIdCounter = 1;

const argv = process.argv.slice(2);
if (argv.length !== 2)
{
	console.log("Usage: node server.js <player1_name> <player2_name>");
	process.exit(1);
}

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws) => {
	let player = null;
	ws.on("message", (message) => {
		if (player) console.log(`Received message from ${player.name}: ${message}`);

		const data = JSON.parse(message);
		switch (data.type) {
			case "input":
				if (!player) return;
				broadcast({...data}, player.matchId);
				break;
			case "connectPlayer":
				try {
					player = addClient(ws, data.matchId);
				} catch (error) {
					console.error("Error adding client:", error);
					ws.close(1000, "Error adding client");
				}
				break;
			case "updateStats":
				if (!player) return;

				const match = matches[player.matchId];
				if (data.madeScore)
					match.players[data.id].score++;

				const score = {type: "updateStats", scoreP1: match.players[1].score, scoreP2: match.players[2].score, nameP1: match.players[1].name, nameP2: match.players[2].name};
				broadcast(score, player.matchId);
				break;
			case "newMatch":
				const newMatch = {
					players: {
						1: {id: 1, name: data.players[1], score: 0},
						2: {id: 2, name: data.players[2], score: 0}
					}
					, winner: null,
					allConnected: data.allConnected,
					id: matchIdCounter++,
					matchStarted: Date.now(),
					matchDuration: 0,
					maxPlayers: data.maxPlayers,
				}
				matches[newMatch.id] = newMatch;
				console.log(`New match created with ID: ${newMatch.id}`);
				ws.send(JSON.stringify({type: "matchCreated", matchId: newMatch.id}));
				break;
			case "backend":
				backend.ws = ws;
				backend.connected = true;
				console.log("Backend connected");
				ws.send(JSON.stringify({type: "Successfully connected to backend", id: backend.id}));
				break;
		};
	})

	ws.on("close", () => {
		try {
			if (!player) return;

			const match = matches[player.matchId];
			if (match) {
				console.log(`Player ${player.name} disconnected from match ${match.id}`);
				player.ws = null;
				player.connected = false;
				player.up = false;
				player.down = false;
				if (Object.values(match.players).filter(p => p.connected).length < match.maxPlayers) {
					broadcast({type: "opponentDisconnected"}, match.id);
					match.allConnected = false;
				}
			}
		}catch (error) {
			console.error("Error handling client disconnect:", error);
		}

	})
});

console.log("WebSocket server is running on ws://localhost:8080");
