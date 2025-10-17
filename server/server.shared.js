export const matches = {};

export const lobby = {
	id: 0,
	name: "lobby",
	ws: null,
	connected: false,
}

export const types = {
	ERROR: "Error",
	CONNECT_PLAYER: "connectPlayer",
	START_GAME: "start",
	END_GAME: "endGame",
	TIMER: "timer",
	OPPONENT_CONNECTED: "opponentConnection",
	OPPONENT_DISCONNECTED: "opponentConnection",
	LOBBY_CONNECTED: "lobbyConnected",
	MATCH_CREATED: "matchCreated",
	UPDATE_STATUS: "updateStats",
	BALL_BOUNCE: "ballCollided",
}

export const closeCodes = {
	NORMAL: 1000,
	POLICY_VIOLATION: 1008,
	INTERNAL_ERROR: 1011,
}
