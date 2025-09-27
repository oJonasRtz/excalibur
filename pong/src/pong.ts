import { gameState, score } from './globals';
import { MidleLine } from './utils/midleLine';
import { MyLabel } from './utils/myLabel';
import * as ex from 'excalibur';
import { Paddle } from './actors/paddle';
import { Ball } from './actors/ball';
import type { MatchStats } from './types';

export class Pong {
	engine: ex.Engine;
	timeLabel: ex.Label;
	startMatch: number;
	scoreLabel: ex.Label;
	maxScore: number = 7;
	matchTime: string;
	winner: string;
	paddle1: Paddle;
	paddle2: Paddle;
	height: number = 50;
	font: ex.Font;
	pauseLabel: MyLabel;
	desconnectedLabel: MyLabel;
	onMatchEnd?: (stats: MatchStats) => void;
	timer: ex.Timer;

	constructor(onMatchEnd?: (stats: MatchStats) => void) {
		this.engine = new ex.Engine({
			width: window.innerWidth,
			height: window.innerHeight,
			displayMode: ex.DisplayMode.FillScreen,
			backgroundColor: ex.Color.Black
		});

		const fontSize = Math.min(this.engine.drawWidth, this.engine.drawHeight) * 0.05;
		this.font = new ex.Font({
			family: 'Impact',
			size: fontSize,
			color: ex.Color.White,
			textAlign: ex.TextAlign.Center
		});
		this.onMatchEnd = onMatchEnd;
		this.drawUi();
		this.drawPlayers();
		this.startMatch = Date.now();
		this.timer = new ex.Timer({
			fcn: () => this.countTime(),
			interval: 1000,
			repeats: true
		});
		this.engine.currentScene.add(this.timer);
		this.timer.start();

		//Global listeners - roda a cada frame
		this.engine.on('preupdate', () => {

			//Var to lock the game
			gameState.allOk = gameState.connected && gameState.opponentConnected && !gameState.pause;

			this.pauseGame();
			this.countTime();
			this.scoreLabel.text = `${score.P1} - ${score.P2}`;
			this.endMatch();
			this.ballReset();
			if (this.engine.input.keyboard.wasPressed(ex.Keys.Escape))
				gameState.pause = !gameState.pause;
			this.disconnected();
		})

		window.addEventListener('resize', () => {
			this.updatePositions();
		});
	}

	updatePositions(): void {
		this.paddle1.pos.x = 50;
		this.paddle2.pos.x = this.engine.drawWidth - 50;

		// Atualiza UI, labels, etc.
		this.scoreLabel.pos.x = this.engine.drawWidth / 2;
		this.scoreLabel.pos.y = 50;
	}

	disconnected(): void{
		if (!this.desconnectedLabel)
			this.desconnectedLabel = new MyLabel("Disconnected", this.engine.drawWidth / 2, this.engine.drawHeight / 2, this.font);

		if (gameState.connected && this.engine.currentScene.actors.includes(this.desconnectedLabel))
			this.engine.currentScene.remove(this.desconnectedLabel);
		else if (!gameState.connected && !this.engine.currentScene.actors.includes(this.desconnectedLabel))
			this.engine.add(this.desconnectedLabel);

	}

	pauseGame(): void {
		if (!this.pauseLabel)
			this.pauseLabel = new MyLabel("Game Paused", this.engine.drawWidth / 2, this.engine.drawHeight / 2, this.font);

		if (this.engine.currentScene.actors.includes(this.pauseLabel) && !gameState.pause)
			this.engine.currentScene.remove(this.pauseLabel);

		if (!gameState.pause) return;

		if (!this.engine.currentScene.actors.includes(this.pauseLabel))
			this.engine.add(this.pauseLabel);
	}

	countTime(): void {
		if (gameState.allOk) return;

		const totalSeconds: number = Math.floor((Date.now() - this.startMatch) / 1000);
		const minutes: string = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
		const seconds: string = String(totalSeconds % 60).padStart(2, '0');
		this.timeLabel.text = `${minutes}:${seconds}`;
	}

	drawUi(): void {
		const textY: number = 20;

		const timerFont = new ex.Font({
			family: 'Impact',
			size: this.font.size * 0.6,
			color: ex.Color.White,
			textAlign: ex.TextAlign.Center
		})

		this.timeLabel = new ex.Label({
			text: `00:00`,
			font: timerFont,
			pos: ex.vec(this.engine.drawWidth / 2, textY + this.font.size + 10),
		})
		this.scoreLabel = new ex.Label({
			text: `${score.P1} - ${score.P2}`,
			font: this.font,
			pos: ex.vec(this.engine.drawWidth / 2, textY),
		})

		this.height = this.timeLabel.pos.y + timerFont.size + 10;
		const middleLine = new MidleLine(this.engine.drawWidth / 2, this.height, 5, this.engine.drawHeight - (textY + this.font.size + 30));


		const player1 = new ex.Label({
			text: `${score.nameP1}`,
			font: this.font,
			color: ex.Color.White,
			pos: ex.vec(this.engine.drawWidth * .2, textY),
		})
		const player2 = new ex.Label({
			text: `${score.nameP2}`,
			font: this.font,
			color: ex.Color.White,
			pos: ex.vec(this.engine.drawWidth * .8, textY),
		})
		
		this.engine.add(middleLine);
		this.engine.add(player1);
		this.engine.add(player2);
		this.engine.add(this.scoreLabel);
		this.engine.add(this.timeLabel);
	}

	drawPlayers(): void{
		this.paddle1 = new Paddle(50, this.engine.drawHeight / 2, 1, this.height);
		this.paddle2 = new Paddle(this.engine.drawWidth - 50, this.engine.drawHeight / 2, 2, this.height);

		this.engine.add(this.paddle1);
		this.engine.add(this.paddle2);
	}

	ballReset():void {
		if (gameState.ballInGame) return;

		const ball = new Ball(this.engine.drawWidth / 2, this.engine.drawHeight / 2, this.height);
		this.engine.add(ball);
		gameState.ballInGame = true;
		gameState.gameStarted = true;
	}

	start(): void {
		this.engine.start();
	}

	endMatch():void {
		if (score.P1 < this.maxScore && score.P2 < this.maxScore) return;

		const winner: string = score.P1 > score.P2 ? score.nameP1 : score.nameP2;
	

		const winnerLabel = new MyLabel(`${winner} wins!`, this.engine.drawWidth / 2, this.engine.drawHeight / 2, this.font);

		const matchStats: MatchStats = {
			winner: winner,
			matchTime: this.timeLabel.text,
			p1Score: score.P1,
			p2Score: score.P2,
			p1Name: score.nameP1,
			p2Name: score.nameP2,
			startTime: new Date(this.startMatch).toISOString(),
			type: "local"
		}
		this.onMatchEnd?.(matchStats);

		this.engine.add(winnerLabel);

		this.timer.stop();
		this.engine.stop();
	}
}
