import "./style.css"
import { connectPlayer } from './connection/connect';
import { Pong } from './game/pong';
import { gameState } from './globals';

connectPlayer();

function waitGameStart(): Promise<void> {
	return new Promise((resolve) => {
		const check = () => {
			if (gameState.gameStarted) {
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
	const pong = new Pong();
	pong.start();
})();
