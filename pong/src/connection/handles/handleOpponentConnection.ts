import { gameState } from "../../globals";

export function handleOpponentConnection(data: any): void {
	gameState.opponentConnected = data.connected;
}
