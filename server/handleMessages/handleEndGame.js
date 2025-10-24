import { removeMatch } from "../creates/createMatch.js";
import { matches, types } from "../server.shared.js";
import { broadcast } from "../utils/broadcast.js";
import { getTime } from "../utils/getTime.js";

// export function handleEndGame(props, winner) {
// 	// if (!backend.connected) return;
// 	// props.player.notifyEnd = true;
// 	props.match.gameEnded = true;

// 	//Wait for both players to notify end
// 	// if (Object.values(props.match.players).some(p => !p.notifyEnd)) return;

// 	const stats = {
// 		type: types.END_GAME,
// 		matchId: props.match.id,
// 		players: Object.fromEntries(
// 			Array.from({length: props.match.maxPlayers}, (_, i) => {
// 				const p = i + 1;
// 				const player = props.match.players[p];

// 				return [
// 					p,
// 					{
// 						id: player.id,
// 						name: player.name,
// 						score: player.score,
// 						winner: winner === player.name,
// 					}
// 				]
// 			}),
// 		),
// 		time: {
// 			duration: (() => {
// 				const { minute, second } = getTime(props.match.matchDuration);
// 				return (`${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`);
// 			})(),
// 			startedAt: (() => {
// 				const time = getTime(props.match.matchStarted);
// 				return `${time.day}/${time.month}/${time.year} | ${time.hour}:${time.minute}:${time.second}`;
// 			})(),
// 		},
// 	};
// 	// backend.ws.send(JSON.stringify(stats));
// 	console.log(`Sent match ${props.match.id} stats to backend`);
// 	console.log(stats);
// 	// removeMatch(props.player.matchIndex);
// 	console.log(`got matches: ${Object.keys(matches)}`);
// 	broadcast({type: types.END_GAME}, props.player.matchIndex);
// }

export function handleEndGame(props, winner) {
	const {match} = props;

	match.endGame(winner);
}