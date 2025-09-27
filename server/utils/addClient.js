import { players } from "../server.shared.js";
import { broadcast } from "./broadcast.js";

let sentInfo = false;

export function addClient(ws, av) {
	const slot = Object.keys(players).find(p => !players[p].connected);
	const player = players[slot];
	player.name = av[slot - 1];
	player.ws = ws;
	player.connected = true;

	players[slot] = player;
	console.log(`Player ${player.name} connected`);
	if (!sentInfo && Object.values(players).filter(p => p.connected).length === 2)
	{
		const data = {p1Name: players[1].name, p2Name: players[2].name, type: "start"};
		broadcast(JSON.stringify(data));
		console.log("Both players connected, game started");
		sentInfo = true;
	}

	return (player);
}
