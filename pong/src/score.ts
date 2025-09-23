import type { ScoreType } from "./types";


//Puxar os nomes dos jogadores futuramente
export const score: ScoreType = {
	nameP1: "Player 1",
	nameP2: "Player 2",
	P1: 0,
	P2: 0
}

export function resetScores(maxScore: number): void {
	if (score.P1 < maxScore && score.P2 < maxScore) return;
	score.P1 = 0;
	score.P2 = 0;
}
