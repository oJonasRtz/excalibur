import { lobby, types } from "../server.shared";
import { handleConnect } from "./handleConnect";

const handlers = {
	[types.recieves.PING]: ({data, match}) => match.pong(data),
	[types.recieves.NEW_MATCH]: ({data, ws}) => lobby.createMatch(data, ws),
	[types.recieves.REMOVE_MATCH]: ({match}) => lobby.removeMatch(match.index, true),
	[types.recieves.CONNECT_PLAYER]: ({ws, data}) => handleConnect(ws, data),
	[types.recieves.CONNECT_LOBBY]: ({ws, data}) => lobby.connect(data, ws),
	[types.recieves.END_GAME]: ({ws}) => lobby.removeMatch(ws.player.matchIndex),
}

export function handleTypes(ws, data) {
	try {
		const type = data.type;
		const match = data.matchId
							? Object.values(matches).filter(m => m).find(m => m.id === data.matchId)
							: null;
		
		console.log(`received type: ${type} with:`, {data});
		if (!match || type === types.recieves.CONNECT_PLAYER || !data.id) return;

		const handler = handlers[type];
		if (!handler) {
			console.error(`No handler for message type: ${type}`);
			return;
		}

		handler({ws, data, match});

	} catch (error) {
		console.log("Error handling message type:", error.message);
	}
}
