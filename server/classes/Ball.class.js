import { INTERVALS, types } from "../server.shared";

export class Ball {
	#direction = {x: 0, y: 0};
	#position = {x: 0, y: 0};
	#speed = .3;
	#lastBounce = null;
	#startTime = null;
	#DELAY = 100;

	constructor(lastScorer) {
		const dir = {"left": -1, "right": 1};

		if (!(lastScorer in dir))
			throw new Error(types.error.TYPE_ERROR);
		const vector = {
			x: !lastScorer ? this.#getRandom() : dir[lastScorer],
			y: this.#getRandom(),
		};

		this.#direction = vector;
		this.#startTime = Date.now() + INTERVALS + (INTERVALS / FPS);
	}
	get direction() {
		return {...this.#direction};
	}
	get startTime() {
		return this.#startTime;
	}
	#getRandom() {
		return (Math.random() < 0.5 ? -1 : 1);
	}

	updatePosition(mapWidth) {
		
		this.#position.x += this.#direction.x * this.#speed
		this.#position.y += this.#direction.y * this.#speed;

		const i = (this.#position.x <= 0) - (this.#position.x >= mapWidth);
		const scorer = {
			0: null,
			1: "right",
			"-1": "left",
		};

		return scorer[i];
	}

	bounce(axis) {
		const now = Date.now();

		if (!this.#lastBounce)
			this.#lastBounce = {axis, time: now - this.#DELAY};

		const sameAxis = this.#lastBounce.axis === axis;
		const tooSoon = now - this.#lastBounce.time < this.#DELAY;

		if (sameAxis && tooSoon) return;

		this.#lastBounce = {axis, time: now};

		const axisMap = {
			'x': () => {
				this.#direction.x = -this.#direction.x;
				if (this.#speed < 1.5) this.#speed += 0.2;
			},
			'y': () => { this.#direction.y = -this.#direction.y; },
		};

		if (!(axis in axisMap))
			throw new Error(types.error.TYPE_ERROR);

		axisMap[axis]();
		console.log(`Ball bounced on ${axis}-axis`);
	}
}
