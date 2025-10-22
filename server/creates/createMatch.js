import { closeCodes, matches } from "../server.shared.js";
import { inactivityDisconnect } from "../utils/inativityDisconnect.js";
import { stopMatchTimer } from "../utils/matchTimer.js";
import { createId } from "./createId.js";

//Default values
const DEFAULT = Object.freeze({
	PLAYERS: 2,
	SCORE: 11,
	MAX_ARRAY_INDEX: 2 ** 32 - 2,
})

let freeIndexes = [];
let index = 0;

export function createMatch(data) {
	const i = freeIndexes.length ? freeIndexes.pop() : index++;

	if (i >= DEFAULT.MAX_ARRAY_INDEX){
		console.log("Maximum number of matches reached");
		return (null);
	}

	const newMatch = {
		allConnected: false,
		players: {},
		id: createId(data.players[1].id, data.players[2].id),
		matchStarted: null,
		matchDuration: 0,
		timer: null,
		maxPlayers: data?.maxPlayers || DEFAULT.PLAYERS,
		maxScore: data?.maxScore || DEFAULT.SCORE,
		gameStarted: false,
		gameEnded: false,
		timeout: null,
		ball: {
			direction: { x: 0, y: 0 },
			exists: false,
			interval: null,
			lastBounce: null,
		},
		lastScorer: null, // "left" | "right" | null
	}

	Object.values(data.players).forEach((p, index) => {
		const side = ((index + 1) % 2 === 0) ? "left" : "right";
		newMatch.players[index + 1] = {
				id: p.id,
				name: p.name,
				score: 0,
				connected: false,
				notifyEnd: false,
				ws: null,
				notifyBallDeath: false,
				side: side,
			};
	});

	matches[i] = newMatch;
	console.log(`New match created with ID: ${newMatch.id}`);
	inactivityDisconnect(i, 5);
	return (newMatch);
}

export function removeMatch(index, force = false) {
	const match = matches[index];
	if (!match) return;

	if (!force && Object.values(match.players).every(p => !p.notifyEnd) && !match.gameEnded) return;

	if (match.timeout)
		clearTimeout(match.timeout);
	match.timeout = null;
	stopMatchTimer(match);
	if (!force) {
		Object.values(matches[index].players).forEach(p => {
			if (p.ws.readyState === p.ws.OPEN) {
				p.ws.close(closeCodes.NORMAL, "Match ended");
			}
		});
	}

	delete matches[index];
	//No double include on freeIndexes
	if (!freeIndexes.includes(Number(index)))
		freeIndexes.push(Number(index));
	console.log(`Match ${index} removed`);
	console.log(`got matches: ${Object.keys(matches)}`);
}
