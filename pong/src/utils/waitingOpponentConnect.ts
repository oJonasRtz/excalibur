import { gameState } from "../globals";
import { MyLabel } from "./myLabel";

let disconnectedLabel: MyLabel;

export function waitOpponentConnect(engine: ex.Engine, font: ex.Font): void {
	if (!disconnectedLabel)
		disconnectedLabel = new MyLabel("Waiting opponent to connect", engine.drawWidth / 2, engine.drawHeight / 2, font);
	if (gameState.opponentConnected && engine.currentScene.actors.includes(disconnectedLabel))
		engine.currentScene.remove(disconnectedLabel);
	else if (!gameState.connected && !engine.currentScene.actors.includes(disconnectedLabel))
		engine.add(disconnectedLabel);
}
