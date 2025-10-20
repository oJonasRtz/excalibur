import { removeMatch } from "../creates/createMatch.js";

export function cleanMatch(props) {
	const { player } = props;
	removeMatch(player.matchIndex);
}