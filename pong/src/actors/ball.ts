import * as ex from 'excalibur';
import { Paddle } from './paddle';
import { gameState, pos } from '../globals';
import { checkVerticalCollision } from '../utils/collision';
import { updateStats } from '../connection/utils/getScore';
import { ballCollided } from '../connection/notify/ballCollided';

// export let side: number = 0;
// export const pos: BallPosition = {
// 	x: Number(gameState.side > .5) - Number(gameState.side < .5),
// 	y: Number(gameState.side > .5) - Number(gameState.side < .5),
// }

export class Ball extends ex.Actor {
	speed: number;
	direction: ex.Vector;
	start: boolean = false;
	upMargin: number;
	constructor(x: number, y: number, upMargin: number = 0) {
		super({
			x: x,
			y: y,
			width: 20,
			height: 20,
			color: ex.Color.White,
			collisionType: ex.CollisionType.Passive
		});
		this.upMargin = upMargin;

		//Velocidade proporcional a tela
		const screenFactor = Math.sqrt(window.innerHeight * window.innerWidth) / 1000;
		this.speed = 0.3 * screenFactor;
		this.direction = new ex.Vector(pos.x, pos.y);
	}

	//Executa apenas uma vez, quando o ator entra na cena
	onInitialize(engine: ex.Engine): void {
		setTimeout(() => {
			this.start = true;
		}, 1000); // 1000 ms = 1 segundo de delay

		this.on('collisionstart', (col) => {
			if (col.other.owner instanceof Paddle) {
				this.direction.x = -this.direction.x;
				this.direction.y = pos.y;

				//speedup
				if (this.speed < 1.5) this.speed += .1;
			}
		})
	}

	//Codigo que roda a cada frame
	onPreUpdate(engine: ex.Engine, delta: number): void {

		if (!this.start) return;

		const moveSpeedx: number = this.speed * this.direction.x * delta;
		const moveSpeedy: number = this.speed * this.direction.y * delta;

		if (checkVerticalCollision(this.pos.y + moveSpeedy, this.height, engine.drawHeight, this.upMargin)) {
			this.direction.y = -this.direction.y;
		}

		this.pos.x += moveSpeedx * Number(gameState.allOk);
		this.pos.y += moveSpeedy * Number(gameState.allOk);

		if (this.pos.x < 0 || this.pos.x > engine.drawWidth) {
			const right: number = Number(this.pos.x > engine.drawWidth);

			ballCollided();
			pos.x = right ? 1 : -1;
			pos.y = (pos.rand > .5) ? 1 : -1;

			// score.P1 += right;
			// score.P2 += left;
			updateStats(right ? 1 : 2, true);
			gameState.ballInGame = !gameState.ballInGame;
			this.kill();
		}
	}
}
