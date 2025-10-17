import { gameState } from "../../globals";

export function handleTimer(data: any): void {
	gameState.timer = data.time;
}
