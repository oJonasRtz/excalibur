import { addClient } from "../creates/addClient.js";
import { closeCodes } from "../server.shared.js";

export function handleConnect(props) {
	try {
		const playerData = addClient(props.ws, props.data);

		props.ws.player = {
			slot: playerData.id,
			matchIndex: playerData.matchIndex,
		}
	} catch (error) {
		console.error("Error adding client:", error.message);
		props.ws.close(closeCodes.INTERNAL_ERROR, "Error adding client");
	}
}
