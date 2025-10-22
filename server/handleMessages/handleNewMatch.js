import { createMatch, removeMatch } from "../creates/createMatch.js";
import { PERMISSION_ERROR } from "../lobby.class.js";
import { lobby, types } from "../server.shared.js";
import { sendError } from "../utils/sendError.js";

export function handleNewMatch(props) {
	const { data, ws } = props;

	if (!data || !lobby.checkPermissions(ws)) {
		sendError(ws, PERMISSION_ERROR);
		return;
	}

	const newMatch = createMatch(data);

	if (!newMatch) {
		lobby.send({type: types.ERROR, reason: types.MATCH_FULL});
		return;
	}

	lobby.send({type: types.MATCH_CREATED, matchId: newMatch.id});
} 
