export function handleEndGame(props, winner) {
	const {match} = props;

	match.endGame(winner);
}
