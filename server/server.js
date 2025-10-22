import { WebSocketServer } from "ws";
import fs from "fs";
import https from "https";
import { DISCONNECT_TIMEOUT, lobby, matches, types } from "./server.shared.js";
import { broadcast } from "./utils/broadcast.js";
import { createMatch, removeMatch } from "./creates/createMatch.js";
import { handleTypes } from "./handleMessages/handleTypes.js";
import 'dotenv/config';
import { inactivityDisconnect } from "./utils/inativityDisconnect.js";

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
	players: {
		1: {id: 314, name: "Pikachu"},
		2: {id: 271, name: "Eevee"}
	}
})

//port 8443 for tests with wss, change to 443  for production
//.env nao esta funcionando ainda verificar futuramente
const PORT = process.env.PORT || 8443;
const HOST = process.env.HOST || 'localhost';
const server = https.createServer({
	key: fs.readFileSync('./ssl/server.key'),
	cert: fs.readFileSync('./ssl/server.cert')
});
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
	ws.player = null;
	ws.on("message", (message) => {
		const data = JSON.parse(message);

		handleTypes(ws.player, data, ws);
	})

	ws.on("error", (error) => {
		console.error("WebSocket error:", error);
	});

	ws.on("close", () => {
		if (lobby.isConnected(ws)) {
			lobby.disconnect();
			return;
		}

		console.log("Connection closed");

		const match = matches[ws.player?.matchIndex] || Object.values(matches).find(m => m && Object.values(m.players).some(p => p.ws === ws));
		if (!match) return;
		const player = ws.player || Object.values(match.players).find(p => p.ws === ws);
		if (!player) return;
		const key = player?.matchIndex || Object.keys(matches).find(i => matches[i] && matches[i].id === match.id);

		console.log(`Player ${player.name} disconnected from match ${match.id}`);
		player.connected = false;
		player.ws = null;

		broadcast({type: types.OPPONENT_DISCONNECTED, connected: false}, key);
		match.allConnected = false;

		if (match.gameStarted && !match.gameEnded && Object.values(match.players).every(p => !p.connected))
			inactivityDisconnect(key);
	})
});

server.listen(PORT, () => {
	console.log(`WebSocket server is running on wss://${HOST}:${PORT}`);
	console.log(`got matches: ${Object.keys(matches)}`);
});
