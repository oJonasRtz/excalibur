import { gameState } from "../../globals";

export function handleStart(): void {
	gameState.gameStarted = true;
	console.log("Game started");
}
