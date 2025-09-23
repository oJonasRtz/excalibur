import * as ex from 'excalibur';
import { Paddle } from './actors/paddle';
import { Ball } from './actors/ball';
import type { GameType, MatchStats } from './types';
import { resetScores, score } from './score';

export const gameState: GameType = {
	ballInGame: false,
	gameStarted: false
}

class Pong {
	engine: ex.Engine;
	timeLabel: ex.Label;
	startMatch: number;
	scoreLabel: ex.Label;
	maxScore: number = 7;
	matchTime: string;
	winner: string;
	constructor() {
		this.engine = new ex.Engine({
			width: 800,
			height: 600,
			displayMode: ex.DisplayMode.Fixed,
			backgroundColor: ex.Color.Black
		});

		this.drawPlayers();
		this.drawUi();
		this.startMatch = Date.now();

		//Global listeners - roda a cada frame
		this.engine.on('preupdate', () => {
			this.countTime();
			this.scoreLabel.text = `${score.P1} - ${score.P2}`;
			this.endMatch();
			this.ballReset();
		})
	}

	countTime(): void {
		const totalSeconds: number = Math.floor((Date.now() - this.startMatch) / 1000);
		const minutes: string = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
		const seconds: string = String(totalSeconds % 60).padStart(2, '0');
		this.timeLabel.text = `${minutes}:${seconds}`;
	}

	drawUi(): void {
		const textY: number = 20;

		const font = new ex.Font({
			family: 'Impact',
			size: 30,
			color: ex.Color.White,
			textAlign: ex.TextAlign.Center
		})

		const timerFont = new ex.Font({
			family: 'Impact',
			size: 20,
			color: ex.Color.White,
			textAlign: ex.TextAlign.Center
		})

		this.timeLabel = new ex.Label({
			text: `00:00`,
			font: timerFont,
			pos: ex.vec(this.engine.drawWidth / 2, textY + font.size + 10),
		})
		this.scoreLabel = new ex.Label({
			text: `${score.P1} - ${score.P2}`,
			font: font,
			pos: ex.vec(this.engine.drawWidth / 2, textY),
		})

		const player1 = new ex.Label({
			text: `${score.nameP1}`,
			font: font,
			color: ex.Color.White,
			pos: ex.vec(70, textY),

		})
		const player2 = new ex.Label({
			text: `${score.nameP2}`,
			font: font,
			color: ex.Color.White,
			pos: ex.vec(this.engine.drawWidth - 70, textY),

		})
		
		this.engine.add(player1);
		this.engine.add(player2);
		this.engine.add(this.scoreLabel);
		this.engine.add(this.timeLabel);
	}

	drawPlayers(): void{
		const paddle1 = new Paddle(50, this.engine.drawHeight / 2);
		const paddle2 = new Paddle(this.engine.drawWidth - 50, this.engine.drawHeight / 2, 2);
		
		this.engine.add(paddle1);
		this.engine.add(paddle2);
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

	endMatch():void {
		if (score.P1 < this.maxScore && score.P2 < this.maxScore) return;

		const winner: string = score.P1 > score.P2 ? score.nameP1 : score.nameP2;
		const font = new ex.Font({
			family: 'Impact',
			size: 50,
			color: ex.Color.White,
			textAlign: ex.TextAlign.Center
		})
		
		const gameOverLabel = new ex.Label({
			text: `${winner} wins!`,
			font: font,
			pos: ex.vec(this.engine.drawWidth / 2, this.engine.drawHeight / 2 + font.size),
		})

		const matchStats: MatchStats = {
			winner: winner,
			matchTime: this.timeLabel.text,
			p1Score: score.P1,
			p2Score: score.P2,
			p1Name: score.nameP1,
			p2Name: score.nameP2,
			startTime: new Date(this.startMatch).toISOString()
		}

		console.log({matchStats});

		this.engine.add(gameOverLabel);
		this.engine.stop();
		resetScores(this.maxScore);
	}
}

const pong = new Pong();
pong.start();
