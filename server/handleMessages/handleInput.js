import { matches } from "../server.shared.js";
import { broadcast } from "../utils/broadcast.js";

export function handleInput(props) {
	// if (!props.player) return;

	// broadcast({...props.data}, props.player.matchIndex);
	const {player, data} = props;

	matches[player.matchIndex].input(data.id, data);
}
