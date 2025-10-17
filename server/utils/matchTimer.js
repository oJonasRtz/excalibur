import { types } from "../server.shared.js";
import { broadcast } from "../utils/broadcast.js";
import { getTime } from "./getTime.js";

const INTERVALS = 1000; //1 second

export function startMatchTimer(match, i) {
	if (!match.matchStarted || match.timer) return;

	match.timer = setInterval(() => {
		match.matchDuration = Date.now() - match.matchStarted;

		const { minute, second } = getTime(match.matchDuration, true);
		const formatted = `${minute}:${second}`;
		const message = {
			type: types.TIMER,
			time: formatted,
		};

		broadcast(message, i);
	}, INTERVALS);
}

export function stopMatchTimer(match) {
	if (match.timer) {
		clearInterval(match.timer);
		match.timer = null;
	}
}
