import { removeMatch } from "../creates/createMatch.js";
import { sendMesage } from "../utils/send.js";

export function cleanMatch(props) {
	const { player } = props;
	removeMatch(player.matchIndex);

	sendMesage(player.ws, {type: "endGame"});
}