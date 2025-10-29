import { WebSocketServer } from "ws";
import fs from "fs";
import https from "https";
import { lobby, matches } from "./server.shared.js";
import { handleTypes } from "./handleMessages/handleTypes.js";
import 'dotenv/config';


//port 8443 for tests with wss, change to 443  for production
//.env nao esta funcionando ainda verificar futuramente
const PORT = process.env.PORT || 8443;
const HOST = process.env.HOST || 'localhost';
// const server = https.createServer({
// 	key: fs.readFileSync('./ssl/server.key'),
// 	cert: fs.readFileSync('./ssl/server.cert')
// });
const wss = new WebSocketServer({ port: PORT });

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

		if (!matches) return;
		try {
			const match = matches[ws.player?.matchIndex] || Object.values(matches).find(m => m && Object.values(m.players).some(p => p.ws === ws));
			if (match)
				match.disconnectPlayer(ws.player?.slot);
			ws.player = null;
		}
		catch (error) {
			console.error("Error during disconnection:", error.message);
		}
	});
});

// server.listen(PORT, () => {
// 	console.log(`WebSocket server is running on wss://${HOST}:${PORT}`);
// 	console.log(`got matches: ${Object.keys(matches)}`);
// });
