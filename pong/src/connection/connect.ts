import { gameState, score } from "../globals";
import { checkKeys } from "./checkKeys";

let socket: WebSocket | null = null;

export function connectPlayer(): void {
	const serverIp = "10.12.1.6";
	socket = new WebSocket(`ws://${serverIp}:8080`);

	socket.onopen = () => {
		console.log('Connected to WebSocket server');
		gameState.connected = true;
	}

	checkKeys(socket);

	socket.onmessage = (event) => {
		const data = JSON.parse(event.data);

		console.log('Message from server:', {data});
		gameState.opponentConnected = data.type !== "opponentDisconnected";

		switch (data.type) {
			case "start":
				score.nameP1 = data.p1Name;
				score.nameP2 = data.p2Name;
				gameState.gameStarted = true;
				break;
			case "input":
				break;
		}
	}

	socket.onerror = (error) => {
		console.error('WebSocket error:', error);
		gameState.connected = false;
	}

	socket.onclose = (event) => {
		const delay = 1000;

		gameState.connected = false;
		console.log(`Disconnected from WebSocket server: ${event.reason}`);
		console.log(`Trying to reconnect in ${delay / 1000} seconds...`);
		setTimeout(connectPlayer, delay);
	}
}
