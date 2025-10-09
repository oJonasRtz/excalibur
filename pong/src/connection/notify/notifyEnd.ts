import { identity } from "../../globals";
import { socket } from "../connect";

export function notifyEnd(winner: string): void {
	if (!socket) return;

	socket.send(JSON.stringify({type: "endGame", winner, matchId: identity.matchId}));
}
