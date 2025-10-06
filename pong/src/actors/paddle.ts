import * as ex from 'excalibur';
import { checkVerticalCollision } from '../utils/collision';
import { gameState, MovePaddles } from '../globals';

export class Paddle extends ex.Actor {
	speed: number;
	number: number;
	upMargin: number;

	constructor(x: number, y: number, player: number = 1, upMargin: number = 0) {
		super({
			x: x,
			y: y,
			width: 20,
			height: 100,
			color: ex.Color.White,
			collisionType: ex.CollisionType.Fixed
		});
		this.upMargin = upMargin;
		this.speed = 1;
		this.number = player;
		console.log(`Paddle ${this.number} created`);
	}

	//Codigo que roda a cada frame
	onPreUpdate(engine: ex.Engine, _delta: number): void {
		const moveSpeed: number = this.getMoveSpeed(engine, _delta);

		//colisao com as bordas
		if (checkVerticalCollision(this.pos.y + moveSpeed, this.height, engine.drawHeight, this.upMargin))
			return;

		//Move a raquete
		this.pos.y += moveSpeed;
	}

	//Utils
	getMoveSpeed(engine: ex.Engine, _delta: number): number {
		// const input: {up: boolean, down: boolean} = MovePaddles[this.number];
		// console.log(this.number, MovePaddles[this.number]);
		const input = MovePaddles[this.number];

		const dir = Number(input.down) - Number(input.up);	

		return((dir * this.speed) * _delta) * Number(gameState.allOk);
	}
}
