import { gameState, identity, MovePaddles, pos, score, setPos } from "../globals";
import { checkKeys, keys } from "./checkKeys";
import { notifyClose } from "./notify/notifyClose";
import { updateStats } from "./utils/getScore";

export let socket: WebSocket | null = null;

export function connectPlayer(): void {
	const serverIp = "localhost";
	socket = new WebSocket(`ws://${serverIp}:8080`);

	socket.onopen = () => {
		console.log('Connected to WebSocket server');
		socket?.send(JSON.stringify({type: "connectPlayer", matchId: identity.matchId, name: identity.name, id: identity.id}));
		gameState.connected = true;
	}

	checkKeys(socket);
	notifyClose();

	socket.onmessage = (event) => {
		const data = JSON.parse(event.data);

		console.log('Message from server:', {data});
		gameState.opponentConnected = data.type !== "opponentDisconnected";

		switch (data.type) {
			case "updateStats":
				for (const [key, val] of Object.entries(data.scores)) {
					const i: number = Number(key);
					const name: string = val.name;
					const scoreVal: number = val.score;
					score[i] = {name, score: scoreVal};
				}
				console.table(score);
				console.log(`Score updated: P1: ${score[1].score} - P2: ${score[2].score}`);
				break;
			case "start":
				gameState.gameStarted = true;
				console.log("Game started");
				break;
			case "connectPlayer":
				identity.id = data.id;
				keys.id = identity.id;
				setPos(data.side);
				console.log(`You are player ${identity.id}`);
				updateStats(identity.id);
				break;
			case "input":
				const id: number = Number(data.id);
				MovePaddles[id].up = data.up as boolean;
				MovePaddles[id].down = data.down as boolean;
				console.log(JSON.parse(JSON.stringify(MovePaddles)));
				break;
			case "timer":
				gameState.timer = data.time;
				break;
			case "ballCollided":
				pos.rand = data.rand;
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
