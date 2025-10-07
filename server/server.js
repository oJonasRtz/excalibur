import { WebSocketServer } from "ws";
import { backend, matches } from "./server.shared.js";
import { broadcast } from "./utils/broadcast.js";
import { addClient } from "./creates/addClient.js";
import { createId } from "./creates/createId.js";
import { createMatch, removeMatch } from "./creates/createMatch.js";

createMatch({
	players: {
		1: {id: 1, name: "Raltz"},
		2: {id: 2, name: "ShaoulinMatadorDePorco"}
	},
})

// const argv = process.argv.slice(2);
// if (argv.length !== 2)
// {
// 	console.log("Usage: node server.js <player1_name> <player2_name>");
// 	process.exit(1);
// }

const wss = new WebSocketServer({ port: 8080, host: "localhost" });

wss.on("connection", (ws) => {
	let player = null;
	ws.on("message", (message) => {
		if (player) console.log(`Received message from ${player.name}: ${message}`);

		const data = JSON.parse(message);
		const match = data.matchId
					? Object.values(matches).find(m => m.id === data.matchId)
					: null;

		switch (data.type) {
			case "input":
				if (!player) return;
				broadcast({...data}, player.matchId);
				createId(player.id, data.id);
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
				const stats = {
					type: "gameEnd",
					matchId: data.matchId,
					winner: data.winner,
					scoreP1: match.players[1].score,
					scoreP2: match.players[2].score,
					nameP1: match.players[1].name,
					nameP2: match.players[2].name,
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
				removeMatch(player.matchId);
				break;
		};
	})

	ws.on("close", () => {
		try {
			if (!player) return;

			// const match = matches[player.matchId];
			const match = Object.values(matches).find(m => m.id === player.matchId);
			if (match) {
				console.log(`Player ${player.name} disconnected from match ${match.id}`);
				player.ws = null;
				player.connected = false;
				player.up = false;
				player.down = false;
				if (Object.values(match.players).filter(p => p.connected).length < match.maxPlayers) {
					const key = Object.keys(matches).find(index => matches[index].id === match.id);
					broadcast({type: "opponentDisconnected"}, key);
					match.allConnected = false;
				}
			}
		}catch (error) {
			console.error("Error handling client disconnect:", error);
		}

	})
});

console.log("WebSocket server is running on ws://localhost:8080");
console.log(`got matches: ${Object.keys(matches)}`);