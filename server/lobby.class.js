export const PERMISSION_ERROR = "Permission denied";

const SECOND = 1000;

export class Lobby {
	#id = process.env.LOBBY_ID;
	#pass = process.env.LOBBY_PASS;
	#ws = null;
	#connected = false;
	//Pending messages to be sent when lobby connects
	#sendQueue = {messages: [], max: 50};
	#retryInterval = null;

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
			if (!data || !this.#connected || !this.#ws || this.#ws.readyState !== 1)
				throw new Error("Lobby not connected or invalid data");
			this.#ws.send(JSON.stringify({...data, timestamp: Date.now()}));
		} catch (error) {
			console.error("Error sending lobby message:", error.message);
			if (this.#sendQueue.messages.length <= this.#sendQueue.max)
				this.#sendQueue.messages.push(data);
		}
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
