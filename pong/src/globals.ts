import type { BallPosition, GameType, IdentityType } from "./types";

export const score: Record<number, {name: string, score: number}> = {};

export const gameState: GameType = {
	ballInGame: false,
	gameEnd: false,
	connected: false,
	gameStarted: false,
	opponentConnected: false,
	allOk: false,
	timer: "00:00",
};

export const movePaddles: Record<number, {up: boolean, down: boolean}> = {
	1: {up: false, down: false},
	2: {up: false, down: false}
};

export const identity: IdentityType = {
	id: 0,
	playerId: Number(prompt("Enter your player ID")) || 1,
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

export const MAXSCORE: number = 11;
export const RECONNECTION__DELAY: number = 10000; //10 seconds

export const LANGUAGE =  "EN";

export  const texts: Record<string, {disconnect: string, win: string, waitOpponent: string}> = {}

texts["EN"] = {disconnect: "Awaiting connection", win: "won!", waitOpponent: "Waiting for opponent..."};
texts["PT"] = {disconnect: "Aguardando conexão", win: "ganhou!", waitOpponent: "Aguardando o oponente..."};
