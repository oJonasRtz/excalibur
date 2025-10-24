import { addClient } from "../creates/addClient.js";
import { closeCodes, types } from "../server.shared.js";
import { broadcast } from "../utils/broadcast.js";

export function handleConnect(props) {
	const {player} = props;
	try {
		player = addClient(props.ws, props.data);
		// props.ws.player = props.player;
		// broadcast({type: types.OPPONENT_CONNECTED, connected: true}, props.player.matchIndex);
	} catch (error) {
		console.error("Error adding client:", error.message);
		props.ws.close(closeCodes.INTERNAL_ERROR, "Error adding client");
	}
}
