export type BallPosition = {
	x: number;
	y: number;
	rand?: number;
}

export type GameType = {
	ballInGame: boolean;
	connected: boolean;
	gameStarted: boolean;
	gameEnd: boolean;
	opponentConnected: boolean;
	allOk: boolean;
	timer: string;
}

export type InputType = {
	id: number;
	matchId: number;
	type: string;
	up: boolean;
	down: boolean;
}

export type IdentityType = {
	id: number;
	playerId: number;
	matchId: number;
	name: string;
}
