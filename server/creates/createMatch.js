import { Match } from "../match.class.js";
import { matches } from "../server.shared.js";


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

	try {
		const newMatch = new Match(data, i);
		matches[i] = newMatch;
		console.log(`New match created with ID: ${newMatch.id}`);
		return (newMatch);
	} catch (error) {
		console.error("Error creating match:", error.message);
		return (null);
	}
}

export function removeMatch(index, force = false) {
	const match = matches[index];

	const stop = !match
				|| (!force && Object.values(match.players).every(p => !p.notifyEnd) && !match.gameEnded);

	if (stop) return;

	match.destroy();

	//No double include on freeIndexes
	if (!freeIndexes.includes(Number(index)))
		freeIndexes.push(Number(index));
	console.log(`Match ${index} removed`);
	console.log(`got matches: ${Object.keys(matches)}`);
}
