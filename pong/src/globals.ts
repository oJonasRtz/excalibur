import type { GameType, ScoreType } from "./types";

export const score: ScoreType = {
	nameP1: "",
	nameP2: "",
	P1: 0,
	P2: 0
}

export const gameState: GameType = {
	ballInGame: false,
	pause: false,
	status: 0,
	connected: false,
	gameStarted: false,
	opponentConnected: false,
	allOk: false,
}


