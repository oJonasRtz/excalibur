import { createId } from "./creates/createId.js";
import { DISCONNECT_TIMEOUT, lobby, matches, types } from "./server.shared.js";
import { getTime } from "./utils/getTime.js";
import { sendMesage } from "./utils/send.js";

const INTERVALS = 1000; //1 sec
const FPS = 60;

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
	#ball = {
		direction: { x: 0, y: 0 },
		exists: false,
		interval: null,
		lastBounce: null,
	};
	#lastScorer = null; // "left" | "right" | null

	constructor (data, index) {
		if (!data.players[1] || !data.players[2]) {
			throw new Error("At least two players are required to create a match.");
		}
		this.#id = createId(data.players[1].id, data.players[2].id);
		this.#maxPlayers = data?.maxPlayers || this.#maxPlayers;
		this.#maxScore = data?.maxScore || this.#maxScore;
		Object.values(data.players).forEach((p, i) => {
			const side = ((i + 1) % 2 === 0) ? "left" : "right";
			this.#players[i + 1] = {
					id: p.id,
					name: p.name,
					score: 0,
					connected: false,
					notifyEnd: false,
					ws: null,
					notifyBallDeath: false,
					side: side,
					tick: INTERVALS / FPS,
					pingInterval: null,
					direction: {up: false, down: false},
			};
		})
		this.#index = index;

		console.log(`New match created with ID: ${this.#id}`);
		this.#inactivityDisconnect(5);
	}
	get id() {
		return this.#id;
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
			if (p.ws && p.ws.readyState === p.ws.OPEN && p.ws !== wsToSkip)
				sendMesage(p.ws, message);
	}
	#inactivityDisconnect(minutes = 1) {
		const timeout = DISCONNECT_TIMEOUT * minutes;

		if (!this.#timeout) {
			this.#timeout = setTimeout(() => {
				console.log(`Match ${this.#id} removed due to inactivity`);
				lobby.removeMatch(this.#index, true);
				lobby.send({type: types.TIMEOUT_REMOVE, matchId: this.#id});
			}, timeout);
		}
	}

	// --- Player Connection ---
	connectPlayer(playerId, ws, name) {
		const slot = Object.keys(this.#players).find(p => this.#players[p].name === name && this.#players[p].id === playerId);

		if (!slot)
			throw new Error("NOTFOUND");

		const player = this.#players[slot];
		if (player.connected && player.ws?.readyState === player.ws.OPEN)
			throw new Error("DUPLICATE");

		player.ws = ws;
		player.connected = true;
		sendMesage(player.ws, {id: slot, type: types.CONNECT_PLAYER, matchId: data.matchId, side: Math.random()});

		// Clear inactivity timeout
		if (this.#timeout) {
			clearTimeout(this.#timeout);
			this.#timeout = null;
		}

		// Check if all players are connected to start the game
		if (Object.values(this.#players).every(p => p.connected)) {
			const data = {type: types.START_GAME};
			this.#allConnected = true;

			if (!this.#matchStarted) {
				this.#matchStarted = Date.now();
				this.#gameStarted = true;
				this.#startTimer();
			}
			this.#broadcast(data);
			this.#setTick(playerId);
		}

		this.#broadcast({type: types.OPPONENT_CONNECTED, connected: true}, ws);
		return { matchIndex: this.#index};
	}
	disconnectPlayer(ws) {
		const player = Object.values(this.#players).find(p => p.ws === ws);
		if (!player) return;

		console.log(`Player ${player.name} disconnected from match ${this.#id}`);
		player.connected = false;
		player.ws = null;

		this.#allConnected = false;
		this.#broadcast({type: types.OPPONENT_DISCONNECTED, connected: false});

		if (this.#gameStarted && !this.#gameEnded && Object.values(this.#players).every(p => !p.connected))
			this.#inactivityDisconnect(5);
	}

	// --- Ping ---
	#setTick(id, delta = this.#players[id]?.tick) {
		if (this.#players[id])
			this.#players[id].tick = delta;
		
		if (this.#players[id].pingInterval)
			clearInterval(this.#players[id].pingInterval);
		this.#players[id].pingInterval = null;
		this.#ping(id);
	}
	#ping(id) {
		if (this.#players[id].pingInterval) return;
	
		const input = Object.keys(this.#players).reduce((acc, id) => {
			acc[id] = this.#players[id].direction;
			return acc;
		}, {});
		const players = Object.keys(this.#players).reduce((acc, id) => {
			acc[id] = {
				name: this.#players[id].name,
				score: this.#players[id].score,
				connected: this.#players[id].connected,
			};
			return acc;
		}, {});
		const message = {
			type: types.PING,
			input,
			time: this.#timeFormated,
			players,
			ballDirection: this.#ball.direction,
		}

		this.#players[id].pingInterval = setInterval(() => {
			if (this.#players[id].ws && this.#players[id].ws.readyState === this.#players[id].ws.OPEN)
				sendMesage(this.#players[id].ws, message);
		}, this.#players[id].tick);	
	}
	#stopPing() {
		Object.values(this.#players).forEach(p => {
			if (p.pingInterval) {
				clearInterval(p.pingInterval);
				p.pingInterval = null;
			}
		});
	}

	// --- Manage Game State ---
	endGame(winner) {
		this.#gameEnded = true;
		this.#stopTimer();

		const stats = {
			type: types.END_GAME,
			matchId: this.#id,
			players: Object.fromEntries(
				Array.from({length: this.#maxPlayers}, (_, i) => {
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
		this.#broadcast({type: types.END_GAME});
	}
	input(id, direction) {
		const p = this.#players[id];
		if (!p) return;

		p.direction.up = direction.up;
		p.direction.down = direction.down;
	}
	#getRandom() {
		return (Math.random() < 0.5 ? -1 : 1);
	}
	newBall() {
		const now = Date.now();
		const timeToStart = now + INTERVALS;
		
		this.#ball.exists = true;
		if (!this.#lastScorer) {
			this.#ball.direction.x = this.#getRandom();
			this.#ball.direction.y = this.#getRandom();
		} else {
			this.#ball.direction.x = this.#lastScorer === "left" ? -1 : 1;
			this.#ball.direction.y = this.#getRandom();
		}

		console.log(`New ball created for match ${this.#id}`);

		this.#broadcast({type: types.NEW_BALL, direction: this.#ball.direction, startTime: timeToStart});
	}
	ballBounce(data) {
		if (!this.#ball.exists) return;

		if (!this.#ball.lastBounce)
			this.#ball.lastBounce = {axis: data.axis, time: Date.now() - DELAY};

		const DELAY = 100; //delay to ignore multiple bounces
		const now = Date.now();
		const sameAxis = this.#ball.lastBounce.axis === data.axis;
		const tooSoon = now - this.#ball.lastBounce.time < DELAY;

		if (sameAxis && tooSoon) return;

		this.#ball.lastBounce = {axis: data.axis, time: now};

		if (data.axis === 'x')
			this.#ball.direction.x = -this.#ball.direction.x;
		if (data.axis === 'y')
			this.#ball.direction.y = -this.#ball.direction.y;

		this.#broadcast({type: types.BOUNCE, direction: this.#ball.direction});
		console.log(`[${this.#id}] Ball bounced on ${data.axis}-axis`);
	}
	ballDeath(scorerSide, player) {
		player.notifyBallDeath = true;
		if (!Object.keys(this.#players).every(p => this.#players[p].notifyBallDeath)) return;

		// Reset notifyBallDeath for all players
		Object.keys(this.#players).forEach(p => {
			this.#players[p].notifyBallDeath = false;
		});

		this.#ball.exists = false;
		this.#lastScorer = scorerSide;
		Object.keys(this.#players).forEach((key) => {
			const p = this.#players[key];

			if (p.side === scorerSide && p.score < this.#maxScore)
				p.score++;

			if (p.score >= this.#maxScore)
				this.endGame(p.name);
		});

		console.log(`Ball death handled for match ${this.#id}`);
		console.log(`Score update: Left Player - ${this.#players[1].score}, Right Player - ${this.#players[2].score}`);
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
