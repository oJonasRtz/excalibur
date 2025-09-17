import * as ex from 'excalibur';
import { Paddle } from './paddle';
import { gameState } from '../main';
import { checkVerticalCollision } from '../utils/collision';

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
		this.speed = .25;
		const side: number = Math.random();
		this.direction = new ex.Vector(0, 0);
		this.direction.x = Number(side > .5) - Number(side < .5);
		this.direction.y = Number(side > .5) - Number(side < .5);
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
				this.direction.y = this.getRandom();
				if (this.speed < 1.5) this.speed += .1;
			}
		})
	}

	getRandom(): number {
		const val: number = Math.random();
		return (Number(val > .5) - Number(val < .5));
	}
	//Codigo que roda a cada frame
	onPreUpdate(engine: ex.Engine, delta: number): void {

		if (!this.start) return;

		const moveSpeedx: number = this.speed * this.direction.x * delta;
		const moveSpeedy: number = this.speed * this.direction.y * delta;

		if (checkVerticalCollision(this.pos.y + moveSpeedy, this.height, engine.drawHeight)) {
			this.direction.y = -this.direction.y;
		}

		this.pos.x += moveSpeedx;
		this.pos.y += moveSpeedy;

		if (this.pos.x < 0 || this.pos.x > engine.drawWidth) {
			gameState.ballInGame = !gameState.ballInGame;
			this.kill();
		}
	}
}
