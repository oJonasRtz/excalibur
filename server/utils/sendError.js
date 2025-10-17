import { types } from "../server.shared.js";

export function sendError(ws, message) {
	const error = {
		type: types.ERROR,
		message,
	}
	ws.send(JSON.stringify(error));
}
