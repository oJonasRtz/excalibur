import { pos } from "../../globals";

export function handleBallCollided(data: any): void {
	pos.rand = data.rand;
}
