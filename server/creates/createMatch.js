import { matches } from "../server.shared.js";
import { stopMatchTimer } from "../utils/matchTimer.js";
import { createId } from "./createId.js";

const MAX_ARRAY_INDEX = 2 ** 32 - 2;
let freeIndexes = [];
let index = 0;

export function createMatch(data) {
	const i = freeIndexes.length ? freeIndexes.pop() : index++;

	if (i >= MAX_ARRAY_INDEX){
		console.log("Maximum number of matches reached");
		return (null);
	}

	const newMatch = {
		// players: {
		// 	1: {id: data.players[1].id, name: data.players[1].name, score: 0, notifyEnd: false},
		// 	2: {id: data.players[2].id, name: data.players[2].name, score: 0, notifyEnd: false}
		// },
		allConnected: false,
		players: {},
		id: createId(data.players[1].id, data.players[2].id),
		// id: data.id, //template
		matchStarted: null,
		matchDuration: 0,
		timer: null,
		maxPlayers: data?.maxPlayers || 2,
		maxScore: 7,
		gameStarted: false,
		gameEnded: false,
	}

	for (let i = 1; i <= newMatch.maxPlayers; i++) {
		newMatch.players[i] = {
			id: data.players[i].id,
			name: data.players[i].name,
			score: 0,
			connected: false,
			notifyEnd: false,
			ws: null,
		}
	}

	matches[i] = newMatch;
	// startMatchTimer(newMatch, i);
	console.log(`New match created with ID: ${newMatch.id}`);
	return (newMatch);
}

export function removeMatch(index, force = false) {
	const match = matches[index];

	if (!force && Object.values(match.players).every(p => !p.notifyEnd) && !match.gameEnded) return;

	stopMatchTimer(match);
	if (!force) {
		Object.values(matches[index].players).forEach(p => {
			if (p.ws.readyState === p.ws.OPEN) {
				p.ws.close(1000, "Match ended");
			}
		});
	}
	delete matches[index];
	//No double include on freeIndexes
	if (!freeIndexes.includes(Number(index)))
		freeIndexes.push(Number(index));
	console.log(`Match ${index} removed`);
}
