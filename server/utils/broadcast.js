import { players } from "../server.shared.js";

export function broadcast(message) {
	for (const p of players) 
		if (p.ws.readyState === p.ws.OPEN) 
			p.ws.send(message);
}
