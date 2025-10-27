import { lobby } from "../server.shared.js";

export function createMatch(data) {
	lobby.createMatch(data);
}

export function removeMatch(index, force = false) {
	lobby.removeMatch(index, force);
}
