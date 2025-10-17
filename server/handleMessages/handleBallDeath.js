export function handleBallDeath(props) {

	//Wait for all players to notify ball death
	props.match.players[props.data.id].notifyBallDeath = true;
	if (Object.values(props.match.players).some(p => !p.notifyBallDeath)) return;

	const left = props.data.scorerSide === "left";
	const right = props.data.scorerSide === "right";
	const ball = props.match.ball;

	Object.assign(ball, {
		exists: false,
		speed: 0,
		position: { x: 0, y: 0 },
	});

	clearInterval(ball.interval);
	ball.interval = null;

	if (left) Object.values(props.match.players).forEach(p => (p.id & 1) === 1 && p.score++);
	if (right) Object.values(props.match.players).forEach(p => (p.id & 1) === 0 && p.score++);

	Object.values(props.match.players).forEach(p => p.notifyBallDeath = false);

	console.log(`Ball death handled for match ${props.match.id}`);
}
