import { gameState } from "../globals";
import type { InputType } from "../types";
import { socket } from "./connect";

export const keys: InputType = {
	id: 0,
	type: "input",
	up: false,
	down: false
};

function handleKey(up: boolean, down: boolean) {
	let changed: boolean = false;

	if (keys.up !== up) {keys.up = up; changed = true;}
	if (keys.down !== down) {keys.down = down; changed = true;}

	if (changed && socket.readyState === socket.OPEN && gameState.id)
		socket.send(JSON.stringify(keys));
}

export function checkKeys(socket: WebSocket | null): void {
	if (!socket) return;

	window.addEventListener("keydown", (event) => {
		const up: boolean = event.key === "ArrowUp" || event.key === "w" || event.key === "W";
		const down: boolean = event.key === "ArrowDown" || event.key === "s" || event.key === "S";

		handleKey(up, down);
	});

	window.addEventListener("keyup", (event) => {
		const up: boolean = event.key === "ArrowUp" || event.key === "w" || event.key === "W";
		const down: boolean = event.key === "ArrowDown" || event.key === "s" || event.key === "S";

		handleKey(!up && keys.up, !down && keys.down);
	});
}
