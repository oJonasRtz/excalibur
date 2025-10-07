/*
	SnowFlake ID generator for matches
	- 42 bits for timestamp
	- 10 bits for player IDs (5 bits each)
	- 12 bits for sequence number
*/
export function createId(p1Id, p2Id) {
	const timestamp = Date.now();
	const date = getDate(timestamp);
	const playerBits = getPlayerBits(p1Id, p2Id);
	const mySequence = getSequence(timestamp);
	const id = (date << 22n) | (playerBits << 12n) | mySequence;

	return (id);
}

let lastTimestamp = 0n;
let sequence = 0n;

function getSequence(timestamp) {
	if (BigInt(timestamp) === lastTimestamp) {
		sequence = (sequence + 1n) & 0b111111111111n;

		if (sequence === 0n) {
			//wait for next millisecond
			while (Date.now() === timestamp) {}
			return getSequence(Date.now());
		}
	}
	else {
		sequence = 0n;
		lastTimestamp = BigInt(timestamp);
	}

	return (sequence);
}

function getPlayerBits(id1, id2) {
	const p1 = BigInt(id1) & 0b11111n;
	const p2 = BigInt(id2) & 0b11111n;
	const bits = (p1 << 5n) | p2; //move p1 to the left by 5 bits and add p2

	return bits;
}

function getDate(date)
{
	const big = BigInt(date);
	const mask = (BigInt(1) << BigInt(42)) - BigInt(1);

	return big & mask;
}
