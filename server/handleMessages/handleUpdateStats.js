import { broadcast } from "../utils/broadcast.js";

export function handleUpdateStats(props) {
	if (!props.player) return;
	
	if (props.data.madeScore)
		props.match.players[props.data.id].score++;
	const score = {
		type: "updateStats",
		scores: (() => {
			const scores = {};
			for (let i = 1; i <= props.match.maxPlayers; i++)	{
				scores[i] = {
					name: props.match.players[i].name,
					score: props.match.players[i].score,
				}
			}
			return (scores);
		})(),
		matchId: props.match.id,
	};
	console.log({score})
	broadcast(score, props.player.matchIndex);
}
