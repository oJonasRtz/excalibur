import type { MatchStats } from './types';
import "./style.css"
import { connectPlayer } from './connection/connect';
import { Pong } from './pong';
import { gameState } from './globals';

connectPlayer();

let finalScore: MatchStats;
const pong = new Pong((stats) => {
	console.log({stats});
	finalScore = stats;
});

function waitGameStart(): Promise<void> {
	return new Promise((resolve) => {
		const check = () => {
			if (gameState.gameStarted) {
				pong.start();
				resolve();
			} else {
				requestAnimationFrame(check);
			}
		}
		check();
	})
}

(async () => {
	await waitGameStart();
})();