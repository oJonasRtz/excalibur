import { types } from "../server.shared.js";
import { broadcast } from "../utils/broadcast.js";

export function handleBallCollided(props) {
	const pos = {
		type: types.BALL_BOUNCE,
		rand: Math.random(),
	}
	broadcast(pos, props.player.matchIndex);
}
