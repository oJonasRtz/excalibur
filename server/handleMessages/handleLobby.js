import { lobby, types } from "../server.shared.js";

export function handleLobby(props) {
	lobby.ws = props.ws;
	lobby.connected = true;
	console.log("lobby connected");
	props.ws.send(JSON.stringify({type: types.LOBBY_CONNECTED, id: lobby.id}));
}
