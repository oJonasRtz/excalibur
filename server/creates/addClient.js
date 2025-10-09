import { matches } from "../server.shared.js";
import { broadcast } from "../utils/broadcast.js";
import { startMatchTimer } from "../utils/matchTimer.js";

export function addClient(ws, data) {
	const match = Object.values(matches).find(m => m.id === data.matchId);
	if (!match) {
		ws.close(1000, "Match not found");
		throw new Error("Match not found");
	}
	console.log(`Data received for match ${data.matchId}:`, data);

	//Try to find player by name or id
	let slot = Object.keys(match.players).find(p => match.players[p].name === data.name);
	if (!slot && data.id) 
		slot = Object.keys(match.players).find(p => match.players[p].id === data.id);

	if (!slot) {
		ws.send(JSON.stringify({type: "Error", reason: "Match full or name/id not recognized"}));
		ws.close(1000, "Match full or name/id not recognized");
		throw new Error("Match full or name/id not recognized");
	}

	const player = match.players[slot];
	//Prevent duplicate connections
	if (player.connected && player.ws?.readyState === player.ws.OPEN) {
		ws.send(JSON.stringify({type: "Error", reason: "Player already connected"}));
		ws.close(1000, "Player already connected");
		throw new Error("Player already connected");
	}

	//Connect player
	player.ws = ws;
	player.connected = true;
	player.matchIndex = Object.keys(matches).find(index => matches[index].id === data.matchId);
	player.ws.send(JSON.stringify({id: slot, type: "connectPlayer", matchId: match.id}));
	console.log(`Player ${player.name} connected to match ${matches[player.matchIndex].id}`);

	//If both players are connected, start the game
	if (Object.values(match.players).every(p => p.connected))
	{
		match.allConnected = true;
		match.gameStarted = true;
		const data = {type: "start"};
		broadcast(data, player.matchIndex);
		console.log("Both players connected, game started");
		startMatchTimer(match, player.matchIndex);
	}

	return (player);
}
