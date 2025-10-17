import { ballPos } from "../../globals";

export function handleBounce(data: any): void {
	if (!data.vector) return;

	ballPos.x = data.vector.x as number;
	ballPos.y = data.vector.y as number;
}
