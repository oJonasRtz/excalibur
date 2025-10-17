import { types } from "../server.shared.js";
import { broadcast } from "../utils/broadcast.js";

export function handleUpdateStats(props) {
	if (!props.player || !props.match || !props.match.players) return;

	//This need  to be fixed to count the score only once per point
	// if (props.data.madeScore && props.match.players[props.data.id].score < props.match.maxScore)
	// 	props.match.players[props.data.id].score++;
	const score = {
		type: types.UPDATE_STATUS,
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
