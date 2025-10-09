import type { GameType, IdentityType, InputType, ScoreType } from "./types";

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
	timer: "00:00",
}

export const MovePaddles: Record<1 | 2, {up: boolean, down: boolean}> = {
	1: {up: false, down: false},
	2: {up: false, down: false}
};

export let latestInput: {data?: InputType} = {};
// export const matchId: number = 1;

export const identity: IdentityType = {
	id: 0,
	matchId: 1,
	name: prompt("Enter your name: ") || "",
};
