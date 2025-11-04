import { lobby, types } from "../server.shared";
import { handleConnect } from "./handleConnect";

const handlers = {
	[types.recieves.PING]: ({data, match}) => match.pong({id: data.id}),
	[types.recieves.NEW_MATCH]: ({data, ws}) => lobby.createMatch({players: data.players, maxPlayers: data.maxPlayers}, ws),
	[types.recieves.REMOVE_MATCH]: ({match}) => lobby.removeMatch(match.index, true),
	[types.recieves.CONNECT_PLAYER]: ({ws, data, match}) => handleConnect(ws, {matchId: data.matchId, playerId: data.playerId, name: data.name, match}),
	[types.recieves.CONNECT_LOBBY]: ({ws, data}) => lobby.connect({pass: data.pass, id: data.id}, ws),
	[types.recieves.END_GAME]: ({ws}) => lobby.removeMatch(ws.player.matchIndex),
	[types.recieves.INPUT]: ({data, match}) => match.input(data.id, {up: data.up, down: data.down}),
}

/*
	Manages the recieved messages
		* Connect players and lobby
		* Manage Lobby requests
		* Calls Match state updates
*/
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
