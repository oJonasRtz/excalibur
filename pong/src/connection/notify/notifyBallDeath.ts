import { ballPos, identity } from "../../globals";
import { socket } from "../connect";

export function notifyBallDeath(scorerSide: 'left' | 'right'): void {
	if (!socket) return;

	socket.send(JSON.stringify({
		type: "ballDeath",
		id: identity.id,
		scorerSide: scorerSide,
	}));

	ballPos.x = 0;
	ballPos.y = 0;
	ballPos.speed = 0;
}
