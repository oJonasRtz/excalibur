import { matches } from "../server.shared.js";
import { handleLobby } from "./handleLobby.js";
import { handleConnect } from "./handleConnect.js";
import { handleInput } from "./handleInput.js";
import { handleNewMatch } from "./handleNewMatch.js";
import { handleUpdateStats } from "./handleUpdateStats.js";
import { handleNewBall } from "./handleNewBall.js";
import { handleBounce } from "./handleBounce.js";
import { handleBallDeath } from "./handleBallDeath.js";
import { cleanMatch } from "./cleanMatch.js";
import { lobbyRemoveMatch } from "./removeMatch.js";

const map = {
	input: handleInput,
	newMatch: handleNewMatch,
	connectPlayer: handleConnect,
	updateStats: handleUpdateStats,
	connectLobby: handleLobby,
	newBall: handleNewBall,
	bounce: handleBounce,
	ballDeath: handleBallDeath,
	endGame: cleanMatch,
	removeMatch: lobbyRemoveMatch
};

export function handleTypes(player, data, ws) {
	const type = data.type;
	const match = data.matchId
						? Object.values(matches).filter(m => m).find(m => m.id === data.matchId)
						: null;

	console.log(`received type: ${type} with:`, {data});
	if (type !== "connectPlayer" && !data.id) return;

	const handler = map[type];
	if (!handler) {
		console.error(`No handler for message type: ${type}`);
		return;
	};

	const props = {
		player: player,
		match: match,
		ws: ws,
		data: data,
	};

	handler(props);
}
