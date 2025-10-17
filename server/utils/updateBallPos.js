import { ballPositions } from "../handleMessages/handleNewBall";

const TICK_RATE = 1000 / 60;

export function updateBallPos() {
	if (!ballPositions.exists || ballPositions.interval) return;

	ballPositions.interval = setInterval(() => {
		
	}, TICK_RATE - (ballPositions.latency || 0));
}