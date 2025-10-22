export const PERMISSION_ERROR = "Permission denied";

export class Lobby {
	#id = process.env.LOBBY_ID;
	#pass = process.env.LOBBY_PASS;
	#ws = null;
	#connected = false;
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
	}
	isConnected(ws = null) {
		if (ws)
			return (this.#connected && this.#ws === ws);
		return this.#connected;
	}
	send(data) {
		try {
			if (data && this.#connected && this.#ws && this.#ws.readyState === 1)
				this.#ws.send(JSON.stringify({...data, timestamp: Date.now()}));
		} catch (error) {
			console.error("Error sending lobby message:", error);
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