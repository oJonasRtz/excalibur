import type { BallPosition, GameType, IdentityType, InputType, ScoreType } from "./types";

export const score: Record<number, {name: string, score: number}> = {};

export const gameState: GameType = {
	ballInGame: false,
	// pause: false,
	status: 0,
	connected: false,
	gameStarted: false,
	opponentConnected: false,
	allOk: false,
	timer: "00:00",
};

export const MovePaddles: Record<1 | 2, {up: boolean, down: boolean}> = {
	1: {up: false, down: false},
	2: {up: false, down: false}
};

export let latestInput: {data?: InputType} = {};
// export const matchId: number = 1;

export const identity: IdentityType = {
	id: 0,
	matchId: Number(prompt("Enter match ID")) || 1,
	name: prompt("Enter your name: ") || "",
};

export const pos: BallPosition = {
	x: 0,
	y: 0,
	rand: 0,
}

export function setPos(side: number): void {
	pos.x = Number(side > .5) - Number(side < .5);
	pos.y = Number(side > .5) - Number(side < .5);
	pos.rand = side;
}
