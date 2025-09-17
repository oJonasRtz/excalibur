import * as ex from 'excalibur';
import { Paddle } from './actors/paddle';
import { Ball } from './actors/ball';
import type { GameType } from './types';

export const gameState: GameType = {
	ballInGame: false,
	gameStarted: false
}

class Pong {
	engine: ex.Engine;
	constructor() {
		this.engine = new ex.Engine({
			width: 800,
			height: 600,
			displayMode: ex.DisplayMode.Fixed,
			backgroundColor: ex.Color.Black
		});

		const paddle1 = new Paddle(50, this.engine.drawHeight / 2);
		const paddle2 = new Paddle(this.engine.drawWidth - 50, this.engine.drawHeight / 2, 2);
		
		this.engine.add(paddle1);
		this.engine.add(paddle2);

		//Global listeners - roda a cada frame
		this.engine.on('preupdate', () => {
			this.ballReset();
		})
	}

	ballReset():void {
		if (gameState.ballInGame) return;

		const ball = new Ball(this.engine.drawWidth / 2, this.engine.drawHeight / 2);
		this.engine.add(ball);
		gameState.ballInGame = true;
		gameState.gameStarted = true;
	}

	start(): void {
		this.engine.start();
	}
}

const pong = new Pong();
pong.start();
