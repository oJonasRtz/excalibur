import { gameState, matchId, MovePaddles, score } from "../globals";
import { checkKeys, keys } from "./checkKeys";
import { updateStats } from "./utils/getScore";

export let socket: WebSocket | null = null;

export function connectPlayer(): void {
	const serverIp = "localhost";
	socket = new WebSocket(`ws://${serverIp}:8080`);

	socket.onopen = () => {
		console.log('Connected to WebSocket server');
		// socket.send(JSON.stringify({type: "newMatch", maxPlayers: 2, players: ["Player1", "Player2"]}));
		socket.send(JSON.stringify({type: "connectPlayer", matchId: matchId}));
		gameState.connected = true;
	}

	checkKeys(socket);

	socket.onmessage = (event) => {
		const data = JSON.parse(event.data);

		console.log('Message from server:', {data});
		gameState.opponentConnected = data.type !== "opponentDisconnected";

		switch (data.type) {
			case "updateStats":
				score.P1 = data.scoreP1;
				score.P2 = data.scoreP2;
				score.nameP1 = data.nameP1;
				score.nameP2 = data.nameP2;
				console.log(`Score updated: P1: ${score.P1} - P2: ${score.P2}`);
				break;
			case "start":
				gameState.gameStarted = true;
				console.log("Game started");
				break;
			case "connectPlayer":
				gameState.id = data.id;
				keys.id = gameState.id;
				console.log(`You are player ${gameState.id}`);
				updateStats(gameState.id);
				break;
			case "input":
				const id: number = Number(data.id);
				MovePaddles[id].up = data.up;
				MovePaddles[id].down = data.down;
				console.log(JSON.parse(JSON.stringify(MovePaddles)));
				break;
			case "timer":
				gameState.timer = data.time;
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
