const KB_FACTOR = 1024;
const MB_FACTOR = 1024 * KB_FACTOR;
const GB_FACTOR = 1024 * MB_FACTOR;

const maxSize = Number(MB_FACTOR);

const keep = 2;
let rotations = 0;
let count = 0;

const RotatingLog = require('rotating-log');

const logfile = 'logs/logs.log';

const log = RotatingLog(logfile, {keep, maxsize: Math.round(maxSize)});

function checkRotations() {
	if (rotations >= keep) {
		console.log('There have been', rotations, '. Quitting websocket.');
		ws.close();
	}
}

log.on('rotated', () => {
	console.log('The log file was rotated.');
	rotations++;
	checkRotations();
});

log.on('error', err => {
	console.error('There was an error: %s', err.message || err);
});
// Log.write( 'data' )

console.log('Logging to', logfile, 'max size =', maxSize);
console.log('execute "tail -f %s" to watch log. press ctrl-c to exit.', logfile);
console.log('Starting:', new Date());

const WebSocket = require('ws');

var ws = new WebSocket('wss://ws-sandbox.kraken.com');
ws.on('open', () => {
	console.log('Open');
	const subData = {
		event: 'subscribe',
		pair: [
		'BTC/USD',
		'ETH/USD',
		'LTC/USD'
		],
		subscription: {
			name: 'ticker'
		}
	};

	ws.send(JSON.stringify(subData));
});

ws.on('close', () => {
	console.log('disconnected');
	logStats();
	console.log('Rotations:', rotations);
	console.log('Finished:', new Date());
	process.exit(0);
});

ws.on('message', rawMessage => {
	console.log('received a message', rawMessage);

	try {
		const message = JSON.parse(rawMessage);
		if (Array.isArray(message)) {
			console.log('got a proper message!');
			count++;
			log.write(rawMessage + '\n');
			// Log.write(data);
		}
	} catch (error) {

	}
});

function logStats() {
	console.log('Total:', count);
}

setInterval(() => {
	logStats();
}, 5000);
