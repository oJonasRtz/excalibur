import { identity } from "../../globals";
import { socket } from "../connect";

export function notifyNewBall(): void {
	if (!socket) return;

	socket.send(JSON.stringify({
		type: "newBall",
		id: identity.id,
		matchId: identity.matchId,
	}));
}
