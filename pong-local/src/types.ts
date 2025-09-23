export type ScoreType = {
	nameP1: string;
	nameP2: string;
	P1: number;
	P2: number;
}

export type MatchStats = {
	winner: string;
	matchTime: string;
	p1Score: number;
	p2Score: number;
	p1Name: string;
	p2Name: string;
	startTime: string;
	type: string;
}

export type BallPosition = {
	x: number;
	y: number;
}

export enum returnStatus {
	notStarted = 0,
	running = 1,
	paused = 2,
	finished = 3
}

export type GameType = {
	ballInGame: boolean;
	status: returnStatus;
	gameStarted: boolean;
}
