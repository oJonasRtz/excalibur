import { identity } from "../../globals";
import { socket } from "../connect";

export function notifyNewBall(speed: number, x: number, y: number, z?: number): void {
	if (!socket) return;

	socket.send(JSON.stringify({
		type: "newBall",
		id: identity.id,
		speed: speed,
		x: x,
		y: y,
		z: z ?? 0,
		delta: Date.now(),
	}));
}
