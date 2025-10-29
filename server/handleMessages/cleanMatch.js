import { lobby } from "../server.shared.js";
import { sendMesage } from "../utils/send.js";

export function cleanMatch(props) {
	const { player } = props;
	lobby.removeMatch(player.matchIndex);
	sendMesage(player.ws, {type: "endGame"});
}
