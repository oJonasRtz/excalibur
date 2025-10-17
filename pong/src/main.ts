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

export async function startGame() {
	await waitGameStart();
	const pong = new Pong();
	pong.start();
};

//This will be called in front-end | erase this line after
startGame();
