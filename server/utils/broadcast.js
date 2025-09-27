import { players } from "../server.shared.js";

export function broadcast(message) {
	for (const p of Object.values(players)) 
		if (p.ws && p.ws.readyState === p.ws.OPEN) 
			p.ws.send(message);
}
