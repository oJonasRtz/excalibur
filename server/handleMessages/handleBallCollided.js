import { broadcast } from "../utils/broadcast.js";

export function handleBallCollided(props) {
	const pos = {
		type: "ballCollided",
		rand: Math.random(),
	}
	broadcast(pos, props.player.matchIndex);
}
