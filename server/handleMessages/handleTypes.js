import { lobby, matches, types } from "../server.shared";
import { handleConnect } from "./handleConnect";

const handlers = {
	[types.recieves.PING]: ({data, match}) =>
		match.pong({id: data.id}),
	[types.recieves.NEW_MATCH]: ({data, ws}) =>
		lobby.createMatch({players: data.players, maxPlayers: data.maxPlayers}, ws),
	[types.recieves.REMOVE_MATCH]: ({match}) =>
		lobby.removeMatch(match.index, true),
	[types.recieves.CONNECT_PLAYER]: ({ws, data, match}) =>
		handleConnect(ws, {playerId: data.playerId, name: data.name, match}),
	[types.recieves.CONNECT_LOBBY]: ({ws, data}) =>
		lobby.connect({pass: data.pass, id: data.id}, ws),
	[types.recieves.END_GAME]: ({ws}) =>
		lobby.removeMatch(ws.player.matchIndex),
	[types.recieves.INPUT]: ({data, match}) =>
		match.input(data.id, {up: data.up, down: data.down}),
}

function validateData(data, type) {
	return (data && typeof data === type);
}

/*
	Manages the recieved messages
		* Connect players and lobby
		* Manage Lobby requests
		* Calls Match state updates
*/
export function handleTypes(ws, data) {
	try {
		if (!validateData(data, 'object'))
			throw new Error(types.error.TYPE_ERROR);

		const {type, matchId, id} = data;
		if (!validateData(type, 'string')
			|| !validateData(matchId, 'number')
			)
			throw new Error(types.error.TYPE_ERROR);

		const match = matchId
			? matches[matchId]
			: null;
		
		console.log(`received type: ${type} with:`, {data});
		//All messages except CONNECT_PLAYER require id
		const newConnection = type === types.recieves.CONNECT_PLAYER;
		if (!match || (!newConnection && !validateData(id, 'number')))
			return;

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
