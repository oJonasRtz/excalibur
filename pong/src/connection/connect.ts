import { gameState, latestInput, MovePaddles, score } from "../globals";
import { checkKeys, keys } from "./checkKeys";

let socket: WebSocket | null = null;

export function connectPlayer(): void {
	const serverIp = "10.11.3.2";
	socket = new WebSocket(`ws://${serverIp}:8080`);

	socket.onopen = () => {
		console.log('Connected to WebSocket server');
		socket.send(JSON.stringify({type: "getId"}));
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
				console.log("Game started");
				break;
			case "getId":
				gameState.id = data.id;
				keys.id = gameState.id;
				console.log(`You are player ${gameState.id}`);
				break;
			case "input":
				if (data.id === 1 || data.id === 2) {
					const id: number = Number(data.id);
					MovePaddles[id].up = data.up;
					MovePaddles[id].down = data.down;

					console.log(JSON.parse(JSON.stringify(MovePaddles)));
				}
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
