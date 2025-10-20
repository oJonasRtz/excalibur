import { socket } from "../connect";

export function handleEndGame(data: any): void {
	if (!socket) return;

	const dat = {
		type: "endGame",
		id: data.id,
		matchId: data.matchId,
	}

	console.log(`[handleEndGame] Sending endGame notification: ${{data}}`);
	socket.send(JSON.stringify(dat));
}