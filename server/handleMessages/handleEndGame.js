import { removeMatch } from "../creates/createMatch.js";
import { matches } from "../server.shared.js";

export function handleEndGame(props) {
	// if (!backend.connected) return;
	props.player.notifyEnd = true;
	props.match.gameEnded = true;
	//Wait for both players to notify end
	if (Object.values(props.match.players).some(p => !p.notifyEnd)) return;

	const duration = (() => {
			const durationMs = props.match.matchDuration;
			const minutes = Math.floor(durationMs / 60000);
			const seconds = Math.floor((durationMs % 60000) / 1000);
			return (`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
	})();
	const date = (() => {
		const date = new Date(props.match.matchStarted);

		const dia = String(date.getDate()).padStart(2, '0');
		const mes = String(date.getMonth() + 1).padStart(2, '0');
		const ano = date.getFullYear();

		const hora = String(date.getHours()).padStart(2, '0');
		const minuto = String(date.getMinutes()).padStart(2, '0');
		const segundo = String(date.getSeconds()).padStart(2, '0');

		return `${dia}/${mes}/${ano} | ${hora}:${minuto}:${segundo}`;
	})();
	const stats = {
		type: "gameEnd",
		matchId: props.match.id,
		players: Object.fromEntries(
			Array.from({length: props.match.maxPlayers}, (_, i) => {
				const p = i + 1;
				const player = props.match.players[p];

				return [
					p,
					{
						id: player.id,
						name: player.name,
						score: player.score,
						winner: props.data.winner === player.name,
					}
				]
			}),
		),
		time: {
			duration: duration,
			startedAt: date,
		},
	};
	// backend.ws.send(JSON.stringify(stats));
	console.log(`Sent match ${props.match.id} stats to backend`);
	console.log(stats);
	removeMatch(props.player.matchIndex);
	console.log(`got matches: ${Object.keys(matches)}`);
}
