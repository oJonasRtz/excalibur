import { createId } from "./creates/createId";
import { DISCONNECT_TIMEOUT, types } from "./server.shared";
import { sendMesage } from "./utils/send";

const INTERVALS = 1000;

export class match {
	#allConnected = false;
	#players = {};
	#id = 0;
	#matchStarted = false;
	#matchDuration = 0;
	#timer = null;
	#maxPlayers = 2;
	#maxScore = 11;
	#gameEnded = false;
	#timeout = null;
	#ball = {
		direction: { x: 0, y: 0 },
		exists: false,
		interval: null,
		lastBounce: null,
	};
	#lastScorer = null; // "left" | "right" | null

	constructor (data) {
		if (!data.players[1] || !data.players[2]) {
			throw new Error("At least two players are required to create a match.");
		}
		this.#id = createId(data.players[1].id, data.players[2].id);
		this.#maxPlayers = data?.maxPlayers || this.#maxPlayers;
		this.#maxScore = data?.maxScore || this.#maxScore;
		Object.values(data.players).forEach((p, i) => {
			const side = ((i + 1) % 2 === 0) ? "left" : "right";
			this.players[i + 1] = {
					id: p.id,
					name: p.name,
					score: 0,
					connected: false,
					notifyEnd: false,
					ws: null,
					notifyBallDeath: false,
					side: side,
					tick: 60000 / 60,
					pingInterval: null,
					direction: {up: false, down: false},
			};
		})

		console.log(`New match created with ID: ${this.#id}`);
	}

	// --- Getters ---
	get allConnected() { return this.#allConnected; }
	get players() { return this.#players; }
	get id() { return this.#id; }
	get matchStarted() { return this.#matchStarted; }
	get matchDuration() { return this.#matchDuration; }
	get timer() { return this.#timer; }
	get maxPlayers() { return this.#maxPlayers; }
	get maxScore() { return this.#maxScore; }
	get gameEnded() { return this.#gameEnded; }
	get timeout() { return this.#timeout; }
	get ball() { return this.#ball; }
	get lastScorer() { return this.#lastScorer; }
	getPlayer(n) {
		return this.#players[n];
	}

	// --- Setters ---
	set allConnected(value) { this.#allConnected = value; }
	set lastScorer(value) { this.#lastScorer = value; }
	set matchStarted(value) { this.#matchStarted = value; }
	set gameEnded(value) { this.#gameEnded = value; }
	set timeout(value) { this.#timeout = value; }


	// --- Match Timer Methods ---
	startTimer() {
		if (!this.#matchStarted || this.#timer) return;

		this.#timer = setInterval(() => {
			this.#matchDuration = Date.now() - this.#matchStarted;

			const minute = Math.floor(this.#matchDuration / 60000);
			const second = Math.floor((this.#matchDuration % 60000) / 1000);
			const formatted = `${minute}:${second.toString().padStart(2, '0')}`;
			const message = {
				type: types.TIMER,
				time: formatted,
			};

			this.broadcast(message);
		}, INTERVALS);
	}
	stopTimer() {
		if (!this.#timer) return;
		clearInterval(this.#timer);
		this.#timer = null;
	}

	// --- Utils ---
	broadcast(message) {
		if (!this.#allConnected) return;

		for (const p of Object.values(this.#players))
			if (p.ws && p.ws.readyState === p.ws.OPEN)
				sendMesage(p.ws, message);
	}

	inactivityDisconnect(minutes = 1) {
		const timeout = DISCONNECT_TIMEOUT * minutes;

		if (!this.#timeout) {
			this.#timeout = setTimeout(() => {
				console.log(`Match ${this.#id} removed due to inactivity`);
				removeMatch(index, true);
				if (lobby.isConnected())
					lobby.send({type: types.TIMEOUT_REMOVE, matchId: this.#id});
			}, timeout);
		}
	}

	// --- Ping ---
	setTick(id, delta) {
		if (this.#players[id])
			this.#players[id].tick = delta;
		
		if (this.#players[id].pingInterval)
			clearInterval(this.#players[id].pingInterval);
		this.#players[id].pingInterval = null;
		this.#ping();
	}
	#ping(id) {
		if (this.#players[id].pingInterval) return;
	
		const input = Object.keys(this.#players).reduce((acc, id) => {
			acc[id] = this.#players[id].direction;
			return acc;
		}, {});
		const message = {
			type: types.PING,
			input,
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

	// --- Cleanup ---
	destroy() {
		if (this.#timeout)
			clearTimeout(this.#timeout);
		this.#timeout = null;
		this.stopTimer();
		this.#stopPing();
		Object.values(this.#players).forEach(p => {
			if (p.ws && p.ws.readyState === p.ws.OPEN)
				p.ws.close(1000, "Match ended");
		});
	}
}
