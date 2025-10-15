import { lobby } from "../server.shared.js";

export function handleLobby(props) {
	lobby.ws = props.ws;
	lobby.connected = true;
	console.log("lobby connected");
	props.ws.send(JSON.stringify({type: "Successfully connected to lobby", id: lobby.id}));
}
