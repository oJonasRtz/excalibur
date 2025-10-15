import { createMatch } from "../creates/createMatch.js";

export function handleNewMatch(props) {
	const newMatch = createMatch(props.data);
	
	if (!newMatch) {
		props.ws.send(JSON.stringify({type: "error", message: "Match could not be created"}));
		return;
	}

	props.ws.send(JSON.stringify({type: "matchCreated", matchId: newMatch.id}));
}
