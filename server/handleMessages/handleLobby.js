import { lobby } from '../server.shared.js';
/*
	data expected:
	{
		type: "lobby"
		pass: string,
	}
*/

export function handleLobby(props) {
	lobby.connect(props.ws, props.data);
}
