import { status, players } from "../server.shared.js";

export function broadcast(message) {
	if (!status.allConnected) return;

	for (const p of Object.values(players)) 
		if (p.ws && p.ws.readyState === p.ws.OPEN) 
			p.ws.send(JSON.stringify(message));
}
