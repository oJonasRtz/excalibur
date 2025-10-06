import { socket } from "../connect";

export function updateStats(id: number, madeScore: boolean = false): void {
	if (!socket) return;

	socket.send(JSON.stringify({type: "updateStats", id, madeScore}));
}