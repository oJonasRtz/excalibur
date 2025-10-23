import 'dotenv/config';
import { Lobby } from './lobby.class.js';

export const matches = {};
export const lobby = new Lobby();

export const types = {
	ERROR: "Error",
	CONNECT_PLAYER: "connectPlayer",
	START_GAME: "start",
	END_GAME: "endGame",
	TIMER: "timer",
	OPPONENT_CONNECTED: "opponentConnection",
	OPPONENT_DISCONNECTED: "opponentConnection",
	MATCH_CREATED: "matchCreated",
	MATCH_FULL: "matchFull",
	UPDATE_STATUS: "updateStats",
	BALL_BOUNCE: "ballCollided",
	LOBBY_ERROR: "lobbyError",
	LOBBY_CONNECTED: "lobbyConnected",
	TIMEOUT_REMOVE: "timeoutRemove",
	PING: "ping",
}

export const closeCodes = {
	NORMAL: 1000,
	POLICY_VIOLATION: 1008,
	INTERNAL_ERROR: 1011,
}

export const DISCONNECT_TIMEOUT = 60000; // 1 minute
