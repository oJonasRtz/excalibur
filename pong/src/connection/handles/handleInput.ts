import { movePaddles } from "../../globals";

export function handleInput(data: any): void {
	const id: number = Number(data.id);

	movePaddles[id].up = data.up as boolean;
	movePaddles[id].down = data.down as boolean;
	console.log(JSON.parse(JSON.stringify(movePaddles)));
}
