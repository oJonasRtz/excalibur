import { score } from "../../globals";

interface ScoreEntry {
	name: string;
	score: number;
}

interface HandlerType {
	type: string;
	matchId: number;
	scores: {[key: string]: ScoreEntry};
}

export function handleUpdateStats(data: HandlerType): void {
	for (const [key, val] of Object.entries(data.scores)) {
		const i: number = Number(key);
		const name: string = val.name;
		const scoreVal: number = val.score;
		score[i] = {name, score: scoreVal};
	}
	console.table(score);
	console.log(`Score updated: P1: ${score[1].score} - P2: ${score[2].score}`);
}
