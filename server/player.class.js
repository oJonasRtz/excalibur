import { INTERVALS } from "./match.class";
import { sendMesage } from "./utils/send";

export class Player {
	#id;
	#name;
	#score = 0;
	#connected = false;
	#notifyEnd = false;
	#ws = null;
	#notifyBallDeath = false;
	#side;
	#tick = INTERVALS / 60;
	#pingInterval = null;
	#direction = {up: false, down: false};

	constructor(data, index) {
		const side = ((index + 1) % 2 === 0) ? "left" : "right";
		this.#id = data.id;
		this.#name = data.name;
		this.#side = side;
	}
	get info() {
		return {
			id: {...this.#id},
			name: {...this.#name},
			score: {...this.#score},
			direction: {...this.#direction},
		}
	}
	get connected() {
		return {...this.#connected};
	}
	get side() {
		return {...this.#side};
	}
	get notifyEnd() {
		return {...this.#notifyEnd};
	}
	get notifyBallDeath() {
		return {...this.#notifyBallDeath};
	}
	set notifyEnd(value) {
		this.#notifyEnd = value;
	}
	set notifyBallDeath(value) {
		this.#notifyBallDeath = value;
	}


	connect(ws) {
		if (this.#connected) 
			throw new Error("DUPLICATE");
		
		this.#ws = ws;
		this.#connected = true;
		sendMesage(this.#ws, {type: "player_connected", playerId: this.#id});
	}
	ping(message) {
		if (this.#pingInterval)
			clearInterval(this.#pingInterval);
		this.#pingInterval = setInterval(() => {
			if (this.#ws && this.#ws.readyState === 1)
				this.send({...message});
		}, this.#tick);
	}
	#pong() {
		
	}
	stopPing() {
		if (this.#pingInterval)
			clearInterval(this.#pingInterval);
		this.#pingInterval = null;
	}
	send(message) {
		if (!this.#connected || !this.#ws || this.#ws.readyState !== 1)
			throw new Error("NOT_CONNECTED");
		this.#ws.send(JSON.stringify({...message, timestamp: Date.now()}));
	}
	destroy() {
		this.#ws.close();
		this.#ws = null;
		this.#connected = false;
	}
}
