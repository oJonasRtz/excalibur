import { gameState } from "../globals";
import type { InputType } from "../types";

export const keys: InputType = {
		id: 0,
		type: "input",
		up: false,
		down: false
	};

export function checkKeys(socket: WebSocket | null): void {
	if (!socket) return;

	window.addEventListener("keydown", (event) => {
		let changed: boolean = false;
		const up: boolean = event.key === "ArrowUp" || event.key === "w" || event.key === "W";
		const down: boolean = event.key === "ArrowDown" || event.key === "s" || event.key === "S";

		if (keys.up !== up) {keys.up = up; changed = true;}
		if (keys.down !== down) {keys.down = down; changed = true;}

		if (changed && socket.readyState === socket.OPEN && gameState.id)
			socket.send(JSON.stringify(keys));
	});

	window.addEventListener("keyup", (event) => {
		const up: boolean = event.key === "ArrowUp" || event.key === "w" || event.key === "W";
		const down: boolean = event.key === "ArrowDown" || event.key === "s" || event.key === "S";

		if (keys.up === true) keys.up = !up;
		if (keys.down === true) keys.down = !down;

		if (socket.readyState === socket.OPEN && gameState.id)
			socket.send(JSON.stringify(keys));
	});
}
