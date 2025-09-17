import * as ex from 'excalibur';
import { Paddle } from './paddle';
import { gameState } from '../main';

export class Ball extends ex.Actor {
	speed: number;
	direction: ex.Vector;
	start: boolean = false;
	constructor(x: number, y: number) {
		super({
			x: x,
			y: y,
			width: 20,
			height: 20,
			color: ex.Color.White,
			collisionType: ex.CollisionType.Passive
		});
		this.speed = .5;
		const side: boolean = Math.random() < .5;
		this.direction = side ? ex.Vector.Right.clone() : ex.Vector.Left.clone();
	}

	//Executa apenas uma vez, quando o ator entra na cena
	onInitialize(engine: ex.Engine): void {
		setTimeout(() => {
			this.start = true;
		}, 1000); // 1000 ms = 1 segundo de delay

		this.on('collisionstart', (col) => {
			console.log(col.other)
			if (col.other.owner instanceof Paddle) {
				this.direction.x = -this.direction.x;
				if (this.speed < 1.5) this.speed += .2;
			}
		})
	}

	//Codigo que roda a cada frame
	onPreUpdate(engine: ex.Engine, delta: number): void {

		if (!this.start) return;

		const moveSpeedx: number = this.speed * this.direction.x * delta;
		const moveSpeedy: number = this.speed * this.direction.y * delta;

		this.pos.x += moveSpeedx;
		this.pos.y += moveSpeedy;

		if (this.pos.x < 0 || this.pos.x > engine.drawWidth) {
			gameState.ballInGame = !gameState.ballInGame;
			this.kill();
		}
	}
}
