import { matches } from "../server.shared.js";
import { sendMesage } from "./send.js";

export function broadcast(message, index) {
	if (!matches || !matches[index] || !matches[index].allConnected) return;

	for (const p of Object.values(matches[index].players))
		if (p.ws && p.ws.readyState === p.ws.OPEN)
			sendMesage(p.ws, message);
}
