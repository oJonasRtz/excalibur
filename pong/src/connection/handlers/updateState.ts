import { ballPos, gameState, movePaddles, score } from "../../globals";

export function updateState(data: any): void {
	try {
		//Ball update
		ballPos.x = data.ballDirection.x;
		ballPos.y = data.ballDirection.y;

		Object.keys(movePaddles).forEach((i) => {
			Object.assign(movePaddles[Number(i)], data.input[i]);
		});

		gameState.timer = data.time;
		Object.keys(data.players).forEach((i) => {
			score[Number(i)].score = data.players[i].score;
			score[Number(i)].name = data.players[i].name;
			if (!data.players[i].connected)
				gameState.opponentConnected = false;
		});

	} catch (error) {
		console.error("Error updating state:", error);
	}
}