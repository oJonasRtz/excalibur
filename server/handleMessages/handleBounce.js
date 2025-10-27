
export function handleBounce(props) {
	const {data, match} = props;
	// let ball = match.ball;

	// if (!ball.lastBounce)
	// 	ball.lastBounce = {axis: data.axis, time: Date.now() - BOUNCE_DELAY};

	// const now = Date.now();
	// const sameAxis = ball.lastBounce.axis === data.axis;
	// const tooSoon = now - ball.lastBounce.time < BOUNCE_DELAY;

	// if (sameAxis && tooSoon) return;

	// ball.lastBounce = {axis: data.axis, time: now};

	// if (data.axis === 'x')
	// 	ball.direction.x = -ball.direction.x;
	// if (data.axis === 'y')
	// 	ball.direction.y = -ball.direction.y;

	// broadcast({type: "bounce", direction: ball.direction}, player.matchIndex);
	// console.log(`[${match.id}] Ball bounced on ${data.axis}-axis`);
	match.ballBounce(data);
}
