import { gameState, MAXSCORE, score } from '../globals';
import { MyLabel } from '../utils/myLabel';
import * as ex from 'excalibur';
import { Paddle } from './actors/paddle';
import { waitOpponentConnect } from '../utils/waitingOpponentConnect';
import { drawPlayers } from './utils/ui/drawPlayers';
import { countTime, drawUi } from './utils/ui/drawUi';
import { ballReset } from './utils/ballReset';
import { disconnected } from './utils/disconnected';
import { endMatch } from './utils/endMatch';

type PongType = {
	engine?: ex.Engine;
	timeLabel?: ex.Label;
	startMatch?: number;
	scoreLabel?: ex.Label;
	maxScore: number;
	matchTime?: string;
	winner?: string;
	paddle1?: Paddle;
	paddle2?: Paddle;
	height: number; 
	font?: ex.Font;
	pauseLabel?: MyLabel;
	desconnectedLabel?: MyLabel;
	timer?: ex.Timer;
}

export class Pong {
	game: PongType = {
		maxScore: MAXSCORE,
		height: 50
	}

	constructor() {
		this.game.engine = new ex.Engine({
			width: window.innerWidth,
			height: window.innerHeight,
			displayMode: ex.DisplayMode.Fixed,
			backgroundColor: ex.Color.Black
		});

		const fontSize = Math.min(this.game.engine.drawWidth, this.game.engine.drawHeight) * 0.05;
		this.game.font = new ex.Font({
			family: 'Impact',
			size: fontSize,
			color: ex.Color.White,
			textAlign: ex.TextAlign.Center
		});

		drawUi.call(this);
		drawPlayers.call(this);

		//Global listeners - roda a cada frame
		this.game.engine.on('preupdate', () => {

			//Var to lock the game
			gameState.allOk = gameState.connected && gameState.opponentConnected;

			this.game.scoreLabel.text = `${score[1]?.score} - ${score[2]?.score}`;
			countTime.call(this);
			endMatch.call(this);
			ballReset.call(this);
			disconnected.call(this);
			waitOpponentConnect(this.game.engine, this.game.font);
		})
	}

	start(): void {
		this.game.engine.start();
	}
}
