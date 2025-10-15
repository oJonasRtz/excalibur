import { broadcast } from "../utils/broadcast.js";

export function handleInput(props) {
	if (!props.player) return;

	broadcast({...props.data}, props.player.matchIndex);
}
