import { removeMatch } from "../creates/createMatch.js";
import { matches } from "../server.shared.js";

export function lobbyRemoveMatch(props) {
	const { data } = props;

	console.log("Removing match with ID:", data.matchId);
	try {
		const i = Object.keys(matches).find(key =>  matches[key].id === data.matchId);
		if (i)
			removeMatch(i, true);
	} catch (error) {
		console.error("Error removing match:", error.message);
	}
}
