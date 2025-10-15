
export function handleBackEnd(props) {
	backend.ws = props.ws;
	backend.connected = true;
	console.log("Backend connected");
	props.ws.send(JSON.stringify({type: "Successfully connected to backend", id: backend.id}));
}
