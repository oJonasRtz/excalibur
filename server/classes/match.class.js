import { createId } from "../creates/createId.js";
import { Player } from "./player.class.js";
import { DISCONNECT_TIMEOUT, FPS, lobby, matches, types } from "../server.shared.js";
import { getTime } from "../utils/getTime.js";
import { sendMesage } from "../utils/send.js";
import { Ball } from "./Ball.class.js";



export class Match {
	#allConnected = false;
	#players = {};
	#id = 0;
	#index = -1;
	#matchStarted = null;
	#gameStarted = false;
	#matchDuration = 0;
	#timer = null;
	#maxPlayers = 2;
	#maxScore = 11;
	#gameEnded = false;
	#timeout = null;
	#timeFormated = "00:00";
	// #ball = {
	// 	direction: { x: 0, y: 0 },
	// 	exists: false,
	// 	interval: null,
	// 	lastBounce: null,
	// };
	#ball = null;
	#lastScorer = null; // "left" | "right" | null
	#lastState = null;
	#pingInterval = null;

	constructor (data, index) {
		try {
			if (!data.players[1] || !data.players[2]) {
				throw new Error(types.error.PLAYER_MISSING);
			}
			this.#id = createId(data.players[1].id, data.players[2].id);
			this.#maxPlayers = data?.maxPlayers || this.#maxPlayers;
			this.#maxScore = data?.maxScore || this.#maxScore;
			Object.values(data.players).forEach((p, i) => {
				const index = i + 1;
				this.#players[index] = new Player(p, index);
			});
			this.#index = index;

			console.log(`New match created with ID: ${this.#id}`);
			this.#inactivityDisconnect(5);
		} catch (error) {
			if (error.name === "TypeError")
				throw new Error(types.error.TYPE_ERROR);

			throw error;
		}
	}
	get id() {
		return this.#id;
	}
	get index() {
		return this.#index;
	}
	// --- Match Timer Methods ---
	#startTimer() {
		if (!this.#matchStarted || this.#timer) return;

		this.#timer = setInterval(() => {
			this.#matchDuration = Date.now() - this.#matchStarted;

			const minute = Math.floor(this.#matchDuration / 60000);
			const second = Math.floor((this.#matchDuration % 60000) / INTERVALS);
			const formatted = `${minute}:${second.toString().padStart(2, '0')}`;

			this.#timeFormated = formatted;
		}, INTERVALS);
	}
	#stopTimer() {
		if (!this.#timer) return;
		clearInterval(this.#timer);
		this.#timer = null;
	}

	// --- Utils ---
	#broadcast(message, wsToSkip = null) {
		if (!this.#allConnected) return;

			for (const p of Object.values(this.#players))
				if (p.ws !== wsToSkip) {
					try {
						p.send(message);
					} catch (error) {
						console.error("Error sending message:", error.message);
					}
				}
	}
	#inactivityDisconnect(minutes = 1) {
		const timeout = DISCONNECT_TIMEOUT * minutes;

		if (!this.#timeout) {
			this.#timeout = setTimeout(() => {
				console.log(`Match ${this.#id} removed due to inactivity`);
				lobby.removeMatch(this.#index, true);
				lobby.send({type: types.message.TIMEOUT_REMOVE, matchId: this.#id});
			}, timeout);
		}
	}

	// --- Player Connection ---
	connectPlayer(playerId, ws, name) {
		let slot = 0;
		for (const [key, p] of Object.entries(this.#players)) {
			try {
				p.connect(ws, playerId, name);
				p.send({type: types.message.CONNECT_PLAYER, id: key, matchId: this.#id, side: Math.random()});
				console.log(`Player ${key} connected to match ${this.#id}`);
				slot = key;
				break;
			} catch (error) {
				// Ignore NOTFOUND errors, log others
				if (error.message !== types.error.NOT_FOUND)
					console.error("Error connecting player:", error.message);
			}
		}

		// Clear inactivity timeout
		if (this.#timeout) {
			clearTimeout(this.#timeout);
			this.#timeout = null;
		}

		// Check if all players are connected to start the game
		if (Object.values(this.#players).every(p => p.connected)) {
			const data = {type: types.message.START_GAME};
			this.#allConnected = true;

			if (!this.#matchStarted) {
				this.#matchStarted = Date.now();
				this.#gameStarted = true;
				this.#startTimer();
			}
			this.#broadcast(data);
			this.#ping();
		}

		this.#broadcast({type: types.message.OPPONENT_CONNECTED, connected: true}, ws);
		return { matchIndex: this.#index, id: slot};
	}
	disconnectPlayer(slot) {
		const player = this.#players[slot];
		if (!player) return;

		player.destroy();
		this.#allConnected = false;
		this.#broadcast({type: types.message.OPPONENT_DISCONNECTED, connected: false});
		
		if (this.#gameStarted && !this.#gameEnded && Object.values(this.#players).every(p => !p.connected))
			this.#inactivityDisconnect(5);
	}

	// --- Ping ---
	#ping() {
		if (this.#pingInterval) return;
	

		this.#pingInterval = setInterval(() => {

			const players =  Object.keys(this.#players).reduce((acc, id) => {
			acc[id] = {
				...this.#players[id].info
			};
			return acc;
			}, {});
			const message = {
				type: types.message.PING,
				time: this.#timeFormated,
				players,
				ballDirection: this.#ball.direction,
			}
			const change = !this.#lastState || (
				JSON.stringify(this.#lastState) !== JSON.stringify(message)
			);
			if (change) {
				this.#broadcast(message);
				this.#lastState = message;
			}
		}, INTERVALS / FPS);
	}
	#stopPing() {
		if (this.#pingInterval) {
			clearInterval(this.#pingInterval);
			this.#pingInterval = null;
		}
	}
	pong(data) {
		try {
			const p = this.#players[data.id];
			p.send({type: "PONG"})
		} catch (error) {
			console.error("Error sending PONG:", error.message);
		}
	}

	// --- Manage Game State ---
	endGame(winner) {
		this.#gameEnded = true;
		this.#stopTimer();

		const stats = {
			type: types.message.END_GAME,
			matchId: this.#id,
			players: Object.fromEntries(
				Array.from({length: this.#maxPlayers}, (_, i) => {;
					const p = i + 1;
					const player = this.#players[p];

					return [
						p,
						{
							id: player.id,
							name: player.name,
							score: player.score,
							winner: winner === player.name,
						}
					]
				})
			),
			time: {
				duration: this.#timeFormated,
				startedAt: (() => {
					const time = getTime(this.#matchStarted);
					return `${time.day}/${time.month}/${time.year} | ${time.hour}:${time.minute}:${time.second}`;
				})(),
			}
		}

		console.log(`Sent match ${this.#id} stats to backend`);
		lobby.send(stats);
		console.log(stats);
		this.#broadcast({type: types.message.END_GAME});
	}
	input(id, direction) {
		try {
			const p = this.#players[id];
			if (!p) return;

			p.direction.up = direction.up;
			p.direction.down = direction.down;
		} catch (error) {
			console.log("Error handling input:", error.message);
		}
	}
	#getRandom() {
		return (Math.random() < 0.5 ? -1 : 1);
	}
	newBall() {
	// 	const now = Date.now();
	// 	const timeToStart = now + INTERVALS;
		
	// 	this.#ball.exists = true;
	// 	if (!this.#lastScorer) {
	// 		this.#ball.direction.x = this.#getRandom();
	// 		this.#ball.direction.y = this.#getRandom();
	// 	} else {
	// 		this.#ball.direction.x = this.#lastScorer === "left" ? -1 : 1;
	// 		this.#ball.direction.y = this.#getRandom();
	// 	}

	// 	console.log(`New ball created for match ${this.#id}`);

	// 	this.#broadcast({type: types.message.NEW_BALL, direction: this.#ball.direction, startTime: timeToStart});

		this.#ball = new Ball(this.#lastScorer);
		console.log(`New ball created for match ${this.#id}`);
	}
	ballBounce(data) {
		// if (!this.#ball.exists) return;

		// if (!this.#ball.lastBounce)
		// 	this.#ball.lastBounce = {axis: data.axis, time: Date.now() - DELAY};

		// const DELAY = 100; //delay to ignore multiple bounces
		// const now = Date.now();
		// const sameAxis = this.#ball.lastBounce.axis === data.axis;
		// const tooSoon = now - this.#ball.lastBounce.time < DELAY;

		// if (sameAxis && tooSoon) return;

		// this.#ball.lastBounce = {axis: data.axis, time: now};

		// if (data.axis === 'x')
		// 	this.#ball.direction.x = -this.#ball.direction.x;
		// if (data.axis === 'y')
		// 	this.#ball.direction.y = -this.#ball.direction.y;

		// this.#broadcast({type: types.message.BOUNCE, direction: this.#ball.direction});
		// console.log(`[${this.#id}] Ball bounced on ${data.axis}-axis`);
		if (!this.#ball) return;
		this.#ball.bounce(data.axis);
	}
	updateBall(data) {
		// player.notifyBallDeath = true;
		// if (!Object.keys(this.#players).every(p => this.#players[p].notifyBallDeath)) return;

		// // Reset notifyBallDeath for all players
		// Object.keys(this.#players).forEach(p => {
		// 	this.#players[p].notifyBallDeath = false;
		// });

		// // this.#ball.exists = false;
		// this.#lastScorer = scorerSide;
		// Object.keys(this.#players).forEach((key) => {
		// 	const p = this.#players[key];

		// 	if (p.side === scorerSide && p.score < this.#maxScore)
		// 		p.score++;

		// 	if (p.score >= this.#maxScore)
		// 		this.endGame(p.name);
		// });

		// console.log(`Ball death handled for match ${this.#id}`);
		// console.log(`Score update: Left Player - ${this.#players[1].score}, Right Player - ${this.#players[2].score}`);
		if (!this.#ball) return;

		const scorer = this.#ball.updatePosition(data.position, data.direction, data.mapWidth);

		if (!scorer) return;

		this.#lastScorer = scorer;
		Object.values(this.#players).forEach((p) => {
			if (p.side === scorer && p.score < this.#maxScore)
				p.score++;

			if (p.score >= this.#maxScore)
				this.endGame(p.name);

			delete this.#ball;
			this.#ball = null;
			this.newBall();
		});

		console.log(`Ball updated for match ${this.#id}`);
	}
	// --- Cleanup ---
	destroy() {
		if (this.#timeout)
			clearTimeout(this.#timeout);
		this.#timeout = null;
		this.#stopTimer();
		this.#stopPing();
		Object.values(this.#players).forEach(p => {
			if (p.ws && p.ws.readyState === p.ws.OPEN)
				p.ws.close(1000, "Match ended");
		});

		delete matches[this.#index];
	}
}
