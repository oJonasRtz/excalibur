import * as ex from 'excalibur';
import { Paddle } from './actors/paddle';
import { Ball } from './actors/ball';
import type { GameType, MatchStats } from './types';
import { score } from './score';

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
	onMatchEnd?: (stats: MatchStats) => void;
	timer: ex.Timer;
	constructor(onMatchEnd?: (stats: MatchStats) => void) {
		this.engine = new ex.Engine({
			width: 1920,
			height: 1080,
			displayMode: ex.DisplayMode.FillScreen,
			backgroundColor: ex.Color.Black
		});

		this.onMatchEnd = onMatchEnd;
		this.drawPlayers();
		this.drawUi();
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
		const fontSize = Math.min(this.engine.drawWidth, this.engine.drawHeight) * 0.05;

		const font = new ex.Font({
			family: 'Impact',
			size: fontSize,
			color: ex.Color.White,
			textAlign: ex.TextAlign.Center
		})

		const timerFont = new ex.Font({
			family: 'Impact',
			size: fontSize * 0.6,
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
			pos: ex.vec(this.engine.drawWidth * .2, textY),

		})
		const player2 = new ex.Label({
			text: `${score.nameP2}`,
			font: font,
			color: ex.Color.White,
			pos: ex.vec(this.engine.drawWidth * .8, textY),

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

		const fontSize = Math.min(this.engine.drawWidth, this.engine.drawHeight) * 0.05;

		const winner: string = score.P1 > score.P2 ? score.nameP1 : score.nameP2;
		const font = new ex.Font({
			family: 'Impact',
			size: fontSize,
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
			startTime: new Date(this.startMatch).toISOString(),
			type: "local"
		}
		this.onMatchEnd?.(matchStats);

		this.engine.add(gameOverLabel);

		this.timer.stop();
		this.engine.stop();
	}
}
let finalScore: MatchStats;
const pong = new Pong((stats) => {
	console.log({stats});
	finalScore = stats;
});
pong.start();
