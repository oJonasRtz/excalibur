import { lobby } from "../server.shared.js";

export function handleNewMatch(props) {
	const { data, ws } = props;

	console.log("Creating new match from lobby...");
	lobby.createMatch(data, ws);
} 
