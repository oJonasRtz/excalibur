import { WebSocketServer } from "ws";
import { backend, matches } from "./server.shared.js";
import { broadcast } from "./utils/broadcast.js";
import { addClient } from "./creates/addClient.js";
import { createId } from "./creates/createId.js";
import { createMatch, removeMatch } from "./creates/createMatch.js";

createMatch({
	players: {
		1: {id: 1, name: "Raltz"},
		2: {id: 2, name: "Kirlia"}
	},
})

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws) => {
	let player = null;
	ws.player = null;
	ws.on("message", (message) => {
		if (player) console.log(`Received message from ${player.name}: ${message}`);

		const data = JSON.parse(message);
		const match = data.matchId
					? Object.values(matches).filter(m => m).find(m => m.id === data.matchId)
					: null;

		switch (data.type) {
			case "input":
				if (!player) return;

				broadcast({...data}, player.matchIndex);
				// createId(player.id, data.id);
				break;
			case "connectPlayer":
				try {
					player = addClient(ws, data);
					ws.player = player;
				} catch (error) {
					console.error("Error adding client:", error);
					ws.close(1000, "Error adding client");
				}
				break;
			case "updateStats":
				if (!player) return;

				if (data.madeScore)
					match.players[data.id].score++;
				const score = {
					type: "updateStats",
					scoreP1: match.players[1].score,
					scoreP2: match.players[2].score,
					nameP1: match.players[1].name,
					nameP2: match.players[2].name,
					matchId: match.id,
				};
				broadcast(score, player.matchIndex);
				break;
			case "newMatch":
				const newMatch = createMatch(data);
				ws.send(JSON.stringify({type: "matchCreated", matchId: newMatch.id}));
				break;
			case "backend":
				backend.ws = ws;
				backend.connected = true;
				console.log("Backend connected");
				ws.send(JSON.stringify({type: "Successfully connected to backend", id: backend.id}));
				break;
			case "endGame":
				// if (!backend.connected) return;
				player.notifyEnd = true;
				match.gameEnded = true;
				//Wait for both players to notify end
				if (Object.values(match.players).some(p => !p.notifyEnd)) return;

				const stats = {
					type: "gameEnd",
					matchId: data.matchId,
					winner: data.winner,
					players: {
						player1: {
							id: match.players[1].id,
							name: match.players[1].name,
							score: match.players[1].score,
						},
						player2: {
							id: match.players[2].id,
							name: match.players[2].name,
							score: match.players[2].score,
						}
					},
					duration: (() => {
						const durationMs = match.matchDuration;
						const minutes = Math.floor(durationMs / 60000);
						const seconds = Math.floor((durationMs % 60000) / 1000);
						return (`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
					})(),
					date: (() => {
						return new Date(match.matchStarted).toISOString();
					})(),
				};
				// backend.ws.send(JSON.stringify(stats));
				console.log(`Sent match ${player.matchId} stats to backend`);
				console.log({stats});
				removeMatch(player.matchIndex);
				console.log(`got matches: ${Object.keys(matches)}`);
				break;
			// case "close":
			// 	closeConnection(ws);
			// 	break;
		};
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

		broadcast({type: "opponentDisconnected"}, key);
		match.allConnected = false;

		if (match.gameStarted && !match.gameEnded && Object.values(match.players).every(p => !p.connected)) {
			console.log(`All players disconnected, removing match ${match.id}`);
			removeMatch(key, true);
		}
	})
});

console.log("WebSocket server is running on ws://localhost:8080");
console.log(`got matches: ${Object.keys(matches)}`);
