
export function checkVerticalCollision(newPos: number, actorHeight: number, roomHeight: number, upMargin: number): boolean {
	const margin: number = 10;
	const bottom: boolean = newPos > ((roomHeight - actorHeight / 2) - margin);
	const top: boolean = newPos < (actorHeight / 2) + margin + upMargin;

	return bottom || top;
}
