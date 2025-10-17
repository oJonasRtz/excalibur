import { identity } from "../../globals";
import { socket } from "../connect";

export function notifyBounce(axis: string): void {
	if (!socket) return;

	socket.send(JSON.stringify({
		type: "bounce",
		id: identity.id,
		axis: axis,
	}));
}
