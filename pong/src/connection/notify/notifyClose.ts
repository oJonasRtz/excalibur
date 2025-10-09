import { identity } from "../../globals";
import { socket } from "../connect";

export function notifyClose(): void {
	window.addEventListener("beforeunload", () => {
		if (socket && socket.readyState === socket.OPEN && identity.id) {
			socket.send(JSON.stringify({type: "close", id: identity.id, matchId: identity.matchId}));
			socket.close(1000, "Connection closed by client");
		}
	});
}