
export function handleNewBall(props) {
	let ball = props.match.ball;

	ball.exists = true;
	ball.speed = props.data.speed;
	ball.position.x = props.data.position.x;
	ball.position.y = props.data.position.y;
	ball.latency = Date.now() - props.data.delta;

	console.log(`New ball created for match ${props.match.id} with speed ${ball.speed} and latency ${ball.latency}ms`);
}
