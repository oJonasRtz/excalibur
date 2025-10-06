import { matches } from "../server.shared.js";

export function broadcast(message, matchid) {
	if (!matches[matchid].allConnected) return;

	for (const p of Object.values(matches[matchid].players)) 
		if (p.ws && p.ws.readyState === p.ws.OPEN) 
			p.ws.send(JSON.stringify(message));
}
