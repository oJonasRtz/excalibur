import * as ex from 'excalibur';
import { checkVerticalCollision } from '../utils/collision';

export class Paddle extends ex.Actor {
	constructor(x: number, y: number, player: number = 1) {
		super({
			x: x,
			y: y,
			width: 20,
			height: 100,
			color: ex.Color.White,
			collisionType: ex.CollisionType.Fixed
		});
		this.speed = 1;
		this.number = player;
	}

	//Codigo que roda a cada frame
	onPreUpdate(engine: ex.Engine, _delta: number): void {

		/*
			Calculo do movimento

			lado direito anda com as setas
			lado esquerdo anda com W e S
		*/
		const side: boolean = this.number % 2 === 0;
		const up: boolean = engine.input.keyboard.isHeld(!side ? ex.Keys.W: ex.Keys.Up);
		const down: boolean = engine.input.keyboard.isHeld(!side ? ex.Keys.S: ex.Keys.Down);
		const dir: number = Number(down) - Number(up);
		const moveSpeed = (dir * this.speed) * _delta;

		//colisao com as bordas
		if (checkVerticalCollision(this.pos.y + moveSpeed, this.height, engine.drawHeight))
			return;

		//Move a raquete
		this.pos.y += moveSpeed;
	}
}
