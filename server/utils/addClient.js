import { matches } from "../server.shared.js";
import { broadcast } from "./broadcast.js";

export function addClient(ws, matchId) {
	const match = matches[matchId];
	if (!match) {
		ws.close(1000, "Match not found");
		throw new Error("Match not found");
	}
	
	const slot = Object.keys(match.players).find(p => !match.players[p].connected);
	if (!slot) {
		ws.send(JSON.stringify({type: "Match full"}));
		ws.close(1000, "Match full");
		throw new Error("Match full");
	}
	const player = match.players[slot];
	player.ws = ws;
	player.connected = true;
	player.matchId = matchId;
	player.ws.send(JSON.stringify({id: slot, type: "connectPlayer"}));
	console.log(`Player ${player.name} connected to match ${matchId}`);

	if (Object.values(match.players).filter(p => p.connected).length === match.maxPlayers)
	{
		match.allConnected = true;
		match.gameStarted = true;
		const data = {type: "start"};
		broadcast(data, matchId);
		console.log("Both players connected, game started");
	}

	return (player);
}
