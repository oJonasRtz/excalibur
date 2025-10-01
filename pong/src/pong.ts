import { gameState, score } from './globals';
import { MidleLine } from './utils/midleLine';
import { MyLabel } from './utils/myLabel';
import * as ex from 'excalibur';
import { Paddle } from './actors/paddle';
import { Ball } from './actors/ball';
import type { MatchStats } from './types';
import { waitOpponentConnect } from './utils/waitingOpponentConnect';

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
		maxScore: 7,
		height: 50
	}
	onMatchEnd?: (stats: MatchStats) => void;

	constructor(onMatchEnd?: (stats: MatchStats) => void) {
		this.game.engine = new ex.Engine({
			width: window.innerWidth,
			height: window.innerHeight,
			displayMode: ex.DisplayMode.FillScreen,
			backgroundColor: ex.Color.Black
		});

		const fontSize = Math.min(this.game.engine.drawWidth, this.game.engine.drawHeight) * 0.05;
		this.game.font = new ex.Font({
			family: 'Impact',
			size: fontSize,
			color: ex.Color.White,
			textAlign: ex.TextAlign.Center
		});
		this.onMatchEnd = onMatchEnd;
		this.drawUi();
		this.drawPlayers();
		this.game.startMatch = Date.now();
		this.game.timer = new ex.Timer({
			fcn: () => this.countTime(),
			interval: 1000,
			repeats: true
		});
		this.game.engine.currentScene.add(this.game.timer);
		this.game.timer.start();

		//Global listeners - roda a cada frame
		this.game.engine.on('preupdate', () => {

			//Var to lock the game
			gameState.allOk = gameState.connected && gameState.opponentConnected && !gameState.pause;

			this.pauseGame();
			this.countTime();
			this.game.scoreLabel.text = `${score.P1} - ${score.P2}`;
			this.endMatch();
			this.ballReset();
			if (this.game.engine.input.keyboard.wasPressed(ex.Keys.Escape))
				gameState.pause = !gameState.pause;
			this.disconnected();
			waitOpponentConnect(this.game.engine, this.game.font);
		})

		window.addEventListener('resize', () => {
			this.updatePositions();
		});
	}

	updatePositions(): void {
		this.game.paddle1.pos.x = 50;
		this.game.paddle2.pos.x = this.game.engine.drawWidth - 50;

		// Atualiza UI, labels, etc.
		this.game.scoreLabel.pos.x = this.game.engine.drawWidth / 2;
		this.game.scoreLabel.pos.y = 50;
	}

	disconnected(): void{
		if (!this.game.desconnectedLabel)
			this.game.desconnectedLabel = new MyLabel("Disconnected", this.game.engine.drawWidth / 2, this.game.engine.drawHeight / 2, this.game.font);

		if (gameState.connected && gameState.opponentConnected && this.game.engine.currentScene.actors.includes(this.game.desconnectedLabel))
			this.game.engine.currentScene.remove(this.game.desconnectedLabel);
		else if ((!gameState.connected || !gameState.opponentConnected) && !this.game.engine.currentScene.actors.includes(this.game.desconnectedLabel))
			this.game.engine.add(this.game.desconnectedLabel);
	}

	pauseGame(): void {
		if (!this.game.pauseLabel)
			this.game.pauseLabel = new MyLabel("Game Paused", this.game.engine.drawWidth / 2, this.game.engine.drawHeight / 2, this.game.font);

		if (this.game.engine.currentScene.actors.includes(this.game.pauseLabel) && !gameState.pause)
			this.game.engine.currentScene.remove(this.game.pauseLabel);

		if (!gameState.pause) return;

		if (!this.game.engine.currentScene.actors.includes(this.game.pauseLabel))
			this.game.engine.add(this.game.pauseLabel);
	}

	countTime(): void {
		if (gameState.allOk) return;

		const totalSeconds: number = Math.floor((Date.now() - this.game.startMatch) / 1000);
		const minutes: string = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
		const seconds: string = String(totalSeconds % 60).padStart(2, '0');
		this.game.timeLabel.text = `${minutes}:${seconds}`;
	}

	drawUi(): void {
		const textY: number = 20;

		const timerFont = new ex.Font({
			family: 'Impact',
			size: this.game.font.size * 0.6,
			color: ex.Color.White,
			textAlign: ex.TextAlign.Center
		})

		this.game.timeLabel = new ex.Label({
			text: `00:00`,
			font: timerFont,
			pos: ex.vec(this.game.engine.drawWidth / 2, textY + this.game.font.size + 10),
		})
		this.game.scoreLabel = new ex.Label({
			text: `${score.P1} - ${score.P2}`,
			font: this.game.font,
			pos: ex.vec(this.game.engine.drawWidth / 2, textY),
		})

		this.height = this.game.timeLabel.pos.y + timerFont.size + 10;
		const middleLine = new MidleLine(this.game.engine.drawWidth / 2, this.height, 5, this.game.engine.drawHeight - (textY + this.game.font.size + 30));


		const player1 = new ex.Label({
			text: `${score.nameP1}`,
			font: this.game.font,
			color: ex.Color.White,
			pos: ex.vec(this.game.engine.drawWidth * .2, textY),
		})
		const player2 = new ex.Label({
			text: `${score.nameP2}`,
			font: this.game.font,
			color: ex.Color.White,
			pos: ex.vec(this.game.engine.drawWidth * .8, textY),
		})

		this.game.engine.add(middleLine);
		this.game.engine.add(player1);
		this.game.engine.add(player2);
		this.game.engine.add(this.game.scoreLabel);
		this.game.engine.add(this.game.timeLabel);
	}

	drawPlayers(): void{
		this.game.paddle1 = new Paddle(50, this.game.engine.drawHeight / 2, 1, this.height);
		this.game.paddle2 = new Paddle(this.game.engine.drawWidth - 50, this.game.engine.drawHeight / 2, 2, this.height);

		this.game.engine.add(this.game.paddle1);
		this.game.engine.add(this.game.paddle2);
	}

	ballReset():void {
		if (gameState.ballInGame) return;

		const ball = new Ball(this.game.engine.drawWidth / 2, this.game.engine.drawHeight / 2, this.height);
		this.game.engine.add(ball);
		gameState.ballInGame = true;
		gameState.gameStarted = true;
	}

	start(): void {
		this.game.engine.start();
	}

	endMatch():void {
		if (score.P1 < this.game.maxScore && score.P2 < this.game.maxScore) return;

		const winner: string = score.P1 > score.P2 ? score.nameP1 : score.nameP2;
	

		const winnerLabel = new MyLabel(`${winner} wins!`, this.game.engine.drawWidth / 2, this.game.engine.drawHeight / 2, this.game.font);

		const matchStats: MatchStats = {
			winner: winner,
			matchTime: this.game.timeLabel.text,
			p1Score: score.P1,
			p2Score: score.P2,
			p1Name: score.nameP1,
			p2Name: score.nameP2,
			startTime: new Date(this.game.startMatch).toISOString(),
			type: "local"
		}
		this.onMatchEnd?.(matchStats);

		this.game.engine.add(winnerLabel);

		this.game.timer.stop();
		this.game.engine.stop();
	}
}
