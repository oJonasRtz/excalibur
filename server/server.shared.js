
//Connected players
export const players = {
	1: {id: 1, name: null, ws: null, score: 0, up: false, down: false, connected: false},
	2: {id: 2, name: null, ws: null, score: 0, up: false, down: false, connected: false}
};

//2 players and the backend
export const status = {
	maxPlayers: 2,
	allConnected: false,
}

// export  const match = {
// 	players: {
// 		1: {id: 1, name: null, ws: null, score: 0, up: false, down: false, connected: false},
// 		2: {id: 2, name: null, ws: null, score: 0, up: false, down: false, connected: false}
// 	},
// 	winner: null,
// 	allConnected: false,
// 	id: null,
// 	matchStarted: Date.now(),
// 	matchDuration: 0,
// 	maxPlayers: 2,
// }

export const matches = {};

const test = {
	players: {
		1: {id: 1, name: "Player1", ws: null, score: 0, up: false, down: false, connected: false},
		2: {id: 2, name: "Player2", ws: null, score: 0, up: false, down: false, connected: false}
	},
	winner: null,
	allConnected: false,
	id: 1,
	maxScore: 7,
	matchStarted: Date.now(),
	matchDuration: 0,
	maxPlayers: 2,
}
matches[1] = test;

const test2 = {
	players: {
		1: {id: 1, name: "Player1", ws: null, score: 0, up: false, down: false, connected: false},
		2: {id: 2, name: "Player2", ws: null, score: 0, up: false, down: false, connected: false}
	},
	winner: null,
	allConnected: false,
	id: 2,
	matchStarted: Date.now(),
	maxScore: 7,
	matchDuration: 0,
	maxPlayers: 2,
}
matches[2] = test2;

export const backend = {
	id: 0,
	name: "backend",
	ws: null,
	connected: false,
}
