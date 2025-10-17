import { createMatch } from "../creates/createMatch.js";
import { types } from "../server.shared.js";
import { sendError } from "../utils/sendError.js";

export function handleNewMatch(props) {
	const newMatch = createMatch(props.data);
	
	if (!newMatch) {
		sendError(props.ws, "Match could not be created");
		return;
	}

	props.ws.send(JSON.stringify({type: types.MATCH_CREATED, matchId: newMatch.id}));
}
