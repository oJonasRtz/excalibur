import readline from 'readline';

export let socket = null;
const ID = 4002;
let matchId = [];

function prompt() {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	rl.setPrompt("<Backend>$ ");
	rl.prompt();
	rl.on('line', (line) => {
		switch (line.trim()) {
			case 'newMatch':
				socket?.send(JSON.stringify({id: ID, type: "newMatch", players: {
					1: {name: "Raichu", id: 16536},
					2: {name: "Pikachu", id: 16537}
				}}));
				break;
			case 'removeMatch':
				const id = matchId.pop();
				console.log("Removing match with ID:", id);
				socket?.send(JSON.stringify({id: ID, type: "removeMatch", matchId: id}));
				break;
		}
		rl.prompt();
	}).on('close', () => {
		console.log('Exiting backend test client.');
		process.exit(0);
	});
}

export function connect() {
	const serverIp = "localhost";
	socket = new WebSocket(`ws://${serverIp}:8443`);

	socket.onopen = () => {
		console.log('Connected to WebSocket server');
		socket?.send(JSON.stringify({type: "connectLobby", pass: "Azarath Metrion Zinthos", id: ID}));
		prompt();
	}
	socket.onmessage = (event) => {
		const data = JSON.parse(event.data);

		console.log('Message from server:', {data});
		if (data.type === "MATCH_CREATED")
			matchId.push(data.matchId);

	}

	socket.onerror = (error) => {
		console.error('WebSocket error:', error);
	}

	socket.onclose = (event) => {
		console.log('WebSocket connection closed:', event);
		
	}
}

connect();
