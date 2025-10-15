import { gameState, LANGUAGE, texts } from "../../globals";
import { MyLabel } from "../../utils/myLabel";

let label: MyLabel;

export function disconnected(): void {
	if (!label)
		label = new MyLabel(texts[LANGUAGE].disconnect, this.game.engine.drawWidth / 2, this.game.engine.drawHeight / 2, this.game.font);

	if (gameState.connected && gameState.opponentConnected && this.game.engine.currentScene.actors.includes(label))
		this.game.engine.currentScene.remove(label);
	else if ((!gameState.connected || !gameState.opponentConnected) && !this.game.engine.currentScene.actors.includes(label))
		this.game.engine.add(label);
}
