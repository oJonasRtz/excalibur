import { gameState } from "../../globals";
import { calculateLatency } from "../utils/getLatency";
import { handleBounce } from "./handleBounce";
import { handleConnectPlayer } from "./handleConnectPlayer";
import { handleEndGame } from "./handleEndGame";
import { handleInput } from "./handleInput";
import { handleNewBall } from "./handleNewBall";
import { handleOpponentConnection } from "./handleOpponentConnection";
import { handleStart } from "./handleStart";
import { handleTimer } from "./handleTimer";
import { handleUpdateStats } from "./handleUpdateStats";
import { updateState } from "./updateState";

type Handler = (data: any) => void;

const map: Record<string, Handler> = {
	PLAYER_CONNECTED: handleConnectPlayer,
	START_GAME: handleStart,
	OPPONENT_CONNECTION: handleOpponentConnection,
	END_GAME: handleEndGame,
	PING: updateState,
	PONG: () => {
		gameState.latency = calculateLatency();
		console.log(`Latency: ${gameState.latency} ms`);
	}
}

export function handleType(data: any) {
	const type: string = data.type;

	const func = map[type as keyof typeof map];
	if (!func) return;

	gameState.latency = Date.now() - data.timestamp;
	func(data);
}

//keep
	endGame
	startGame
	opponentConnection
	Ping