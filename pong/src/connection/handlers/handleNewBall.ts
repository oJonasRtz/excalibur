import { ballPos } from "../../globals";

export function handleNewBall(data: any): void {
	ballPos.x = data.direction.x;
	ballPos.y = data.direction.y;
	ballPos.startTime = data.startTime;
}