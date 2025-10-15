import { matches } from "../server.shared.js";

export function broadcast(message, index) {
	if (!matches || !matches[index] || !matches[index].allConnected) return;

	for (const p of Object.values(matches[index].players))
		if (p.ws && p.ws.readyState === p.ws.OPEN) 
			p.ws.send(JSON.stringify(message));
}
