import { gameState } from "../../globals";
import { handleBounce } from "./handleBounce";
import { handleConnectPlayer } from "./handleConnectPlayer";
import { handleEndGame } from "./handleEndGame";
import { handleInput } from "./handleInput";
import { handleNewBall } from "./handleNewBall";
import { handleOpponentConnection } from "./handleOpponentConnection";
import { handleStart } from "./handleStart";
import { handleTimer } from "./handleTimer";
import { handleUpdateStats } from "./handleUpdateStats";

type Handler = (data: any) => void;

const map: Record<string, Handler> = {
	updateStats: handleUpdateStats,
	connectPlayer: handleConnectPlayer,
	input: handleInput,
	timer: handleTimer,
	start: handleStart,
	opponentConnection: handleOpponentConnection,
	bounce: handleBounce,
	newBall: handleNewBall,
	endGame: handleEndGame,
}

export function handleType(data: any) {
	const type: string = data.type;

	const func = map[type as keyof typeof map];
	if (!func) return;

	gameState.latency = Date.now() - data.timestamp;
	console.log(`Latency: ${gameState.latency} ms`);
	func(data);
}
