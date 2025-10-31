import { Match } from "./classes/match.class.js";
import { closeCodes, lobby, matches, types } from "./server.shared.js";
import { sendError } from "./utils/sendError.js";

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
	#connectionError(ws, message) {
		sendError(ws, message);
		ws.close(closeCodes.POLICY_VIOLATION, message);
	}
	connect(data, ws) {
		try {
			if (this.#connected) {
				this.#connectionError(ws, types.error.PERMISSION_ERROR);
				return;
			}

			if (data.pass !== this.#pass || data.id !== this.#id) {
				this.#connectionError(ws, types.error.PERMISSION_ERROR);
				return;
			}

			this.#ws = ws;
			this.#connected = true;
			console.log("Lobby.connect: lobby connected");
			this.send({type: types.message.LOBBY_CONNECTED});
			this.#sendPending();
		} catch (error) {
			console.error("Lobby.connect: Error connecting lobby:", error.message);
			this.#connectionError(ws, types.message.ERROR);
		}
	}
	isConnected(ws = null) {
		if (ws)
			return (this.#connected && this.#ws === ws);
		return this.#connected;
	}
	send(data) {
		try {
			if (!data)
				throw new Error(types.error.TYPE_ERROR);
			if (!this.#connected || !this.#ws || this.#ws.readyState !== 1) {
				if (this.#sendQueue.messages.length <= this.#sendQueue.max)
					this.#sendQueue.messages.push(data);
				else
					throw new Error("Send queue full, message dropped");
				console.log(`Lobby.send: pending queue: ${JSON.stringify(this.#sendQueue.messages)}`);
				return;
			}
			this.#ws.send(JSON.stringify({...data, timestamp: Date.now()}));
		} catch (error) {
			if ([error.name, error.message].includes(types.error.TYPE_ERROR)) {
				console.error("Lobby.send: Type error detected");
				return;
			}
			console.error("Lobby.send: Error sending lobby message:", error.message);
			if (this.#sendQueue.messages.length <= this.#sendQueue.max)
				this.#sendQueue.messages.push(data);
		}
	}
	// --- Match Management ---
	createMatch(data, ws) {
		try {
			if (!this.checkPermissions(ws))
				throw new Error(types.error.PERMISSION_ERROR);

			const i = this.#freeIndexes.length ? this.#freeIndexes.pop() : this.#index++;

			const newMatch = new Match(data, i);
			matches[i] = newMatch;
			this.send({type: types.message.MATCH_CREATED, matchId: newMatch.id});
		} catch (error) {
			console.error("Error creating match:", error.message);
			this.send({type: types.message.ERROR, error: error.message});
		}
	}
	//Fazer tratamento para o force = pedir credenciais
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
		lobby.send({type: types.message.MATCH_REMOVED, matchId: match.id});
	}
	#sendPending() {
		if (!this.#sendQueue.messages.length || !this.#connected || !this.#ws || this.#ws.readyState !== 1) return;

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
