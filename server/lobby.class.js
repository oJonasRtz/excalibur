import { Match } from "./match.class.js";
import { closeCodes, lobby, matches, types } from "./server.shared.js";
import { sendError } from "./utils/sendError.js";

export const PERMISSION_ERROR = "Permission denied";

const SECOND = 1000;

export class Lobby {
	#id = Number(process.env.LOBBY_ID);
	#pass = process.env.LOBBY_PASS;
	#ws = null;
	#connected = false;
	//Pending messages to be sent when lobby connects
	#sendQueue = {messages: [], max: 50};
	#retryInterval = null;
	#index = 0;
	#freeIndexes = [];
1
	constructor() {
		this.#retryInterval = setInterval(() => {
			this.#sendPending();
		}, 10 * SECOND);
	}
	connect(data, ws) {
		if (this.#connected) {
			sendError(ws, PERMISSION_ERROR);
			ws.close(closeCodes.POLICY_VIOLATION, PERMISSION_ERROR);
			return;
		}

		console.log(`login: ${this.#id} | pass: ${this.#pass}`);

		if (data.pass !== this.#pass || data.id !== this.#id) {
			sendError(ws, PERMISSION_ERROR);
			ws.close(closeCodes.POLICY_VIOLATION, PERMISSION_ERROR);
			return;
		}

		this.#ws = ws;
		this.#connected = true;
		console.log("lobby connected");
		this.send({type: types.LOBBY_CONNECTED});
		this.#sendPending();
	}
	isConnected(ws = null) {
		if (ws)
			return (this.#connected && this.#ws === ws);
		return this.#connected;
	}
	send(data) {
		try {
			if (!data)
				throw new Error("Invalid data");
			if (!this.#connected || !this.#ws || this.#ws.readyState !== 1) {
				if (this.#sendQueue.messages.length <= this.#sendQueue.max)
					this.#sendQueue.messages.push(data);
				else
					throw new Error("Send queue full, message dropped");
				console.log(`pending queue: ${JSON.stringify(this.#sendQueue.messages)}`);
				return;
			}
			this.#ws.send(JSON.stringify({...data, timestamp: Date.now()}));
		} catch (error) {
			console.error("Error sending lobby message:", error.message);
			if (this.#sendQueue.messages.length <= this.#sendQueue.max)
				this.#sendQueue.messages.push(data);
		}
	}
	// --- Match Management ---
	createMatch(data, ws) {
		if (!this.checkPermissions(ws))
			throw new Error(PERMISSION_ERROR);

		const i = this.#freeIndexes.length ? this.#freeIndexes.pop() : this.#index++;

		try {
			const newMatch = new Match(data, i);
			matches[i] = newMatch;
			this.send({type: types.MATCH_CREATED, matchId: newMatch.id});
			return (newMatch);
		} catch (error) {
			console.error("Error creating match:", error.message);
		}
	}
	removeMatch(index, force = false) {
		const match = matches[index];
		const stop = !match
					|| (!force && Object.values(match.players).every(p => !p.notifyEnd) && !match.gameEnded);

		if (stop) return;

		match.destroy();

		if (!this.#freeIndexes.includes(Number(index)))
			this.#freeIndexes.push(Number(index));
		console.log(`Match ${index} removed`);
		console.log(`got matches: ${Object.keys(matches)}`);
		lobby.send({type: types.MATCH_REMOVED, matchId: match.id});
	}
	#sendPending() {
		if (!this.#connected || !this.#ws || this.#ws.readyState !== 1) return;

		while (this.#sendQueue.messages.length) {
			const data = this.#sendQueue.messages[0];
			try {
				this.#ws.send(JSON.stringify({...data, timestamp: Date.now()}));
				this.#sendQueue.messages.shift();
			} catch (error) {
				break;
			}
		}

		console.log(`pending queue after send: ${JSON.stringify(this.#sendQueue.messages)}`);
	}
	checkPermissions(ws) {
		return (this.#connected && this.#ws === ws);
	}
	disconnect() {
		if (!this.#connected) return;

		this.#ws = null;
		this.#connected = false;
		console.log("lobby disconnected");
	}
}
