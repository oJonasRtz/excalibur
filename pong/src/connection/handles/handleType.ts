import { handleBallCollided } from "./handleBallCollided";
import { handleConnectPlayer } from "./handleConnectPlayer";
import { handleInput } from "./handleInput";
import { handleOpponentConnection } from "./handleOpponentConnection";
import { handleStart } from "./handleStart";
import { handleTimer } from "./handleTimer";
import { handleUpdateStats } from "./handleUpdateStats";

type Handler = (data: any) => void;

const map: Record<string, Handler> = {
	updateStats: handleUpdateStats,
	ballCollided: handleBallCollided,
	connectPlayer: handleConnectPlayer,
	input: handleInput,
	timer: handleTimer,
	start: handleStart,
	opponentConnection: handleOpponentConnection,
}

export function handleType(data: any) {
	const type: string = data.type;

	const func = map[type as keyof typeof map];
	if (!func) return;

	func(data);
}
