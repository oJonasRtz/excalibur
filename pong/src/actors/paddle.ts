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
		//KeyBindings
		//left players: W (up) S (down)
		//right players: Up (up) Down (down)
		// if (gameState.allOk && (MovePaddles[1].up || MovePaddles[1].down || MovePaddles[2].up || MovePaddles[2].down))
		// 	console.log({MovePaddles});
		const input = {...MovePaddles[this.number]};

		// if (gameState.allOk && input)
		// 	console.log(`Paddle ${this.number} Input: `, JSON.parse(JSON.stringify(input)));

		const dir = Number(input.down) - Number(input.up);	
		if (gameState.allOk)
			console.log(`Paddle ${this.number} Move: ${dir} input: `, JSON.parse(JSON.stringify(input)));

		return((dir * this.speed) * _delta) * Number(gameState.allOk);
	}
}
