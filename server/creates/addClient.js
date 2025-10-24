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

// export function addClient(ws, data) {
// 	const match = Object.values(matches).find(m => m.id === data.matchId);

// 	closeConnection(ws, errorMessages.NOTFOUND, !match);
// 	console.log(`Data received for match ${data.matchId}:`, data);

// 	const slot = Object.keys(match.players).find(p => match.players[p].name === data.name && match.players[p].id === data.playerId);
// 	closeConnection(ws, errorMessages.FULL, !slot);


// 	const player = match.players[slot];
// 	//Prevent duplicate connections
// 	closeConnection(ws, errorMessages.DUPLICATE, player.connected && player.ws?.readyState === player.ws.OPEN);

// 	//Connect player
// 	player.ws = ws;
// 	player.connected = true;
// 	player.matchIndex = Object.keys(matches).find(index => matches[index].id === data.matchId);
// 	// player.ws.send(JSON.stringify({id: slot, type: types.CONNECT_PLAYER, matchId: data.matchId, side: Math.random()}));
// 	sendMesage(player.ws, {id: slot, type: types.CONNECT_PLAYER, matchId: data.matchId, side: Math.random()});
// 	console.log(`Player ${player.name} connected to match ${matches[player.matchIndex].id}`);

// 	if (match.timeout)
// 		clearTimeout(match.timeout);
// 	match.timeout = null;

// 	//If both players are connected, start the game
// 	if (Object.values(match.players).every(p => p.connected))
// 	{
// 		const data = {type: types.START_GAME};
// 		match.allConnected = true;

// 		if (!match.gameStarted)
// 		{
// 			match.gameStarted = true;
// 			console.log("Both players connected, game started");
// 			match.matchStarted = Date.now();
// 			startMatchTimer(match, player.matchIndex);
// 		}
// 		broadcast(data, player.matchIndex);
// 	}

// 	return (player);
// }

export function addClient(ws, data) {
	const match = Object.values(matches).find(m => m.id === data.matchId);
	
	closeConnection(ws, errorMessages.NOTFOUND, !match);
	console.log(`Data received for match ${data.matchId}:`, data);

	try {
		match.connectPlayer(data.playerId, ws, data.name);
		console.log(`Player ${data.name} connected to match ${match.id}`);
	} catch (error) {
		const message = error.message;
		const map = {
			"NOTFOUND": errorMessages.FULL,
			"DUPLICATE": errorMessages.DUPLICATE,
		}
		closeConnection(ws, map[message], message in map);
	}
}
