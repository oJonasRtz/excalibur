import { matches } from "../server.shared.js";
import { handleBackEnd } from "./handleBackend.js";
import { handleBallCollided } from "./handleBallCollided.js";
import { handleConnect } from "./handleConnect.js";
import { handleEndGame } from "./handleEndGame.js";
import { handleInput } from "./handleInput.js";
import { handleNewMatch } from "./handleNewMatch.js";
import { handleUpdateStats } from "./handleUpdateStats.js";

const map = {
	input: handleInput,
	newMatch: handleNewMatch,
	connectPlayer: handleConnect,
	updateStats: handleUpdateStats,
	endGame: handleEndGame,
	ballCollided: handleBallCollided,
	backend: handleBackEnd,
};

export function handleTypes(player, data, ws) {
	const type = data.type;
	const match = data.matchId
						? Object.values(matches).filter(m => m).find(m => m.id === data.matchId)
						: null;

	const handler = map[type];
	if (!handler) return;

	const props = {
		player: player,
		match: match,
		ws: ws,
		data: data,
	};

	handler(props);
}
