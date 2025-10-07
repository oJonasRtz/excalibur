import { matches } from "../server.shared.js";
import { startMatchTimer, stopMatchTimer } from "../utils/matchTimer.js";
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
		players: {
			1: {id: data.players[1].id, name: data.players[1].name, score: 0},
			2: {id: data.players[2].id, name: data.players[2].name, score: 0}
		},
		allConnected: false,
		// id: createId(data.players[1].id, data.players[2].id),
		id: 1, //template
		matchStarted: Date.now(),
		matchDuration: 0,
		timer: null,
		maxPlayers: 2,
		maxScore: 7,
		gameStarted: false,
	}

	matches[i] = newMatch;
	startMatchTimer(newMatch, i);
	console.log(`New match created with ID: ${newMatch.id}`);
	return (newMatch);
}

export function removeMatch(index) {
	const match = matches[index];

	stopMatchTimer(match);
	matches[index] = undefined;
	//No double include on freeIndexes
	if (!freeIndexes.includes(Number(index)))
		freeIndexes.push(Number(index));
	console.log(`Match ${index} removed`);
}
