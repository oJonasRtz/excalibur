import { closeCodes, matches } from "../server.shared.js";
import { sendError } from "../utils/sendError.js";

const errorMessages = {
	NOTFOUND: "Match not found",
	FULL: "Match full or name/id not recognized",
	DUPLICATE: "Player already connected",
}

function closeConnection(ws, message, condition) {
	if (condition) {
		sendError(ws, message);
		ws.close(closeCodes.POLICY_VIOLATION, message);
		throw new Error(message);
	}
}

export function addClient(ws, data) {
	const match = Object.values(matches).find(m => m.id === data.matchId);
	
	closeConnection(ws, errorMessages.NOTFOUND, !match);
	console.log(`Data received for match ${data.matchId}:`, data);

	try {
		const { matchIndex, id } = match.connectPlayer(data.playerId, ws, data.name);
		console.log(`Player ${data.name} connected to match ${match.id}`);
		return { matchIndex: matchIndex, id: id };
	} catch (error) {
		const message = error.message;
		const map = {
			"NOTFOUND": errorMessages.FULL,
			"DUPLICATE": errorMessages.DUPLICATE,
		}
		closeConnection(ws, map[message], message in map);
	}
}
