import * as ex from 'excalibur';
import { gameState, score } from '../../../globals';
import { MidleLine } from '../../../utils/midleLine';
import { addElements } from './addElements';

const TEXT_Y: number = 20;

function createLabel(text: string, font: ex.Font, x: number, y: number): ex.Label {
	return new ex.Label({
		text,
		font,
		color: ex.Color.White,
		pos: ex.vec(x, y),
	});
}

export function drawUi() {
	const timerFont = new ex.Font({
		family: 'Impact',
		size: this.game.font.size * 0.6,
		color: ex.Color.White,
		textAlign: ex.TextAlign.Center
	});

	this.game.timeLabel = createLabel(gameState.timer, timerFont, this.game.engine.drawWidth / 2, TEXT_Y + this.game.font.size + 10);
	this.game.scoreLabel = createLabel(`${score[1]?.name} - ${score[2]?.name}`, this.game.font, this.game.engine.drawWidth / 2, TEXT_Y);
	this.height = this.game.timeLabel.pos.y + timerFont.size + 10;

	const middleLine = new MidleLine(this.game.engine.drawWidth / 2, this.height, 5, this.game.engine.drawHeight - (TEXT_Y + this.game.font.size + 30));
	const player1 = createLabel(`${score[1]?.name}`, this.game.font, this.game.engine.drawWidth * .2, TEXT_Y);
	const player2 = createLabel(`${score[2]?.name}`, this.game.font, this.game.engine.drawWidth * .8, TEXT_Y);

	addElements.call(this, [middleLine, player1, player2, this.game.scoreLabel, this.game.timeLabel]);
}
  
export function countTime() {
	if (!gameState.allOk) return;

	this.game.timeLabel.text = gameState.timer;
}
