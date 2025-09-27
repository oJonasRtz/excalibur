import { players } from "../server.shared.js";

export function addClient(ws, name) {
	const id = players.length + 1;
	const player = {id, ws, score: 0, up: false, down: false, name};

	players.push(player);
	console.log(`Player ${player.name} connected`);
	if (players.length === 2)
	{
		const data = {p1Name: players[0].name, p2Name: players[1].name, type: "start"};
		for (const p of players)
			if (p.ws.readyState === p.ws.OPEN)
				p.ws.send(JSON.stringify(data));
		console.log("Both players connected, game started");
	}

	return (player);
}
