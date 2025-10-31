import { DISCONNECT_TIMEOUT, lobby, matches } from "../server.shared.js";

export function inactivityDisconnect(index ,minutes = 1) {
	const timeout = DISCONNECT_TIMEOUT * minutes;
	const match = matches[index];

	if (!match) return;

	if (!match.timeout) {
		match.timeout = setTimeout(() => {
			console.log(`Match ${match.id} removed due to inactivity`);
			lobby.removeMatch(index, true);
			if (lobby.isConnected())
				lobby.send({type: types.message.TIMEOUT_REMOVE, matchId: match.id});
		}, timeout);
	}
}