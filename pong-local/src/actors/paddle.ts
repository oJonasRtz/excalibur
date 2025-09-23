import * as ex from 'excalibur';
import { checkVerticalCollision } from '../utils/collision';

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
		//KeyBindings
		//left players: W (up) S (down)
		//right players: Up (up) Down (down)
		const side: boolean = this.number % 2 === 0;
		const up: boolean = engine.input.keyboard.isHeld(!side ? ex.Keys.W: ex.Keys.Up);
		const down: boolean = engine.input.keyboard.isHeld(!side ? ex.Keys.S: ex.Keys.Down);
		
		const dir: number = Number(down) - Number(up);
		return (dir * this.speed) * _delta;
	}
}
