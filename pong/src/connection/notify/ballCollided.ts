import { identity } from "../../globals";
import { socket } from "../connect";

export function ballCollided(): void {
	if (!socket) return;
	socket.send(JSON.stringify({type: "ballCollided", matchId: identity.matchId}));
}