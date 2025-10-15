import { gameState } from "../../globals";
import { Ball } from "../actors/ball";

export function ballReset() {
	if (gameState.ballInGame) return;
	
	const ball = new Ball(this.game.engine.drawWidth / 2, this.game.engine.drawHeight / 2, this.height);
	gameState.ballInGame = true;
	gameState.gameStarted = true;

	this.game.engine.add(ball);
}
