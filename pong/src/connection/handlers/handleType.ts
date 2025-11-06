import { gameState, identity, state } from "../../globals";
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
	// PLAYER_CONNECTED: handleConnectPlayer,
	// START_GAME: handleStart,
	// OPPONENT_CONNECTION: handleOpponentConnection,
	// END_GAME: handleEndGame,
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

	func(data);
}

function updateState(data: Object): void {
	try {
		const {ball, game, players} = data as any;
		
		state.ballPos.exist = ball.exists;
		state.ballPos.vector = ball.position;

		state.timer = game.timer;
		state.gameStarted = game.gameStarted;
		state.gameEnd = game.gameEnd;

		for (const [key, val] of Object.entries(players)) {
			const i: number = Number(key) + 1;

			state.players[i].name = val.name;
			state.players[i].score = val.score;
			state.players[i].up = val.up;
			state.players[i].down = val.down;
			
			if (i === identity.id)
				state.connection.me = val.connected;
			else
				state.connection.opponent = val.connected;
		}
	} catch (error) {
		console.error("Error updating state:", error);
	}
}

//keep
	// endGame
	// startGame
	// opponentConnection
	// Ping