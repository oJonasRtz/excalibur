import { types } from "../server.shared.js";
import { sendMesage } from "./send.js";

export function sendError(ws, message) {
	const error = {
		type: types.ERROR,
		message,
	}
	// ws.send(JSON.stringify(error));
	sendMesage(ws, error);
}
