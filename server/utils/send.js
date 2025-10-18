
export function sendMesage(ws, message) {
	if (!ws || ws.readyState !== ws.OPEN) return;

	ws.send(JSON.stringify({...message, timestamp: Date.now()}));
}
