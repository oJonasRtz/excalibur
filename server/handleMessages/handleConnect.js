import { addClient } from "../creates/addClient.js";
import { broadcast } from "../utils/broadcast.js";

export function handleConnect(props) {
	try {
		props.player = addClient(props.ws, props.data);
		props.ws.player = props.player;
		broadcast({type: "opponentConnection", connected: true}, props.player.matchIndex);
	} catch (error) {
		console.error("Error adding client:", error);
		props.ws.close(1000, "Error adding client");
	}
}
