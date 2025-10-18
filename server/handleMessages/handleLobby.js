import { lobby, types } from "../server.shared.js";
import { sendMesage } from "../utils/send.js";

export function handleLobby(props) {
	lobby.ws = props.ws;
	lobby.connected = true;
	console.log("lobby connected");
	// props.ws.send(JSON.stringify({type: types.LOBBY_CONNECTED, id: lobby.id}));
	sendMesage(props.ws, {type: types.LOBBY_CONNECTED, id: lobby.id});
}
