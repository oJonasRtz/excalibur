import { broadcast } from "../utils/broadcast.js";

const INTERVALS = 1000; //1 second

export function startMatchTimer(match, i) {
	if (!match.matchStarted || match.timer) return;

	match.timer = setInterval(() => {
		match.matchDuration = Date.now() - match.matchStarted;

		const minutes = Math.floor(match.matchDuration / 60000);
		const seconds = Math.floor((match.matchDuration % 60000) / 1000);
		const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
		const message = {
			type: "timer",
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
