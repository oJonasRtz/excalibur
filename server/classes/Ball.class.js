import { types } from "../server.shared";

export class Ball {
	#direction = {x: 0, y: 0};
	#position = {x: 0, y: 0};
	#lastBounce = null;
	#DELAY = 100;

	constructor(lastScorer) {
		const dir = {"left": -1, "right": 1};

		if (!lastScorer || !(lastScorer in dir))
			throw new Error(types.error.TYPE_ERROR);
		const vector = {
			x: !lastScorer ? this.#getRandom() : dir[lastScorer],
			y: this.#getRandom(),
		};

		this.#direction = vector;
	}

	#getRandom() {
		return (Math.random() < 0.5 ? -1 : 1);
	}

	updatePosition(newPos, newDir, mapWidth) {
		const isValidVector = (v) => v && typeof v.x === "number" && typeof v.y === "number";
		if (!isValidVector(newPos) || !isValidVector(newDir))
			throw new Error(types.error.TYPE_ERROR);

		this.#position.x = newPos.x;
		this.#position.y = newPos.y;
		this.#direction.x = newDir.x;
		this.#direction.y = newDir.y;

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
			'x': () => { this.#direction.x = -this.#direction.x; },
			'y': () => { this.#direction.y = -this.#direction.y; },
		};

		if (!(axis in axisMap))
			throw new Error(types.error.TYPE_ERROR);

		axisMap[axis]();
		console.log(`Ball bounced on ${axis}-axis`);
	}
}
