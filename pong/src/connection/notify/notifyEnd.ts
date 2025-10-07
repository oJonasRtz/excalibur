import { socket } from "../connect";

export function notifyEnd(): void {
	if (!socket) return;

	socket.send(JSON.stringify({type: "endGame"}));
}
