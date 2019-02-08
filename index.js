/*
*	Scrape from WebSocket stream and rotate them to disk
*/

var KB_FACTOR = 1024;
var MB_FACTOR = 1024 * KB_FACTOR;
var GB_FACTOR = 1024 * MB_FACTOR;

var maxSize = 1 * MB_FACTOR;

var keep = 2;
var rotations = 0;
var count = 0;

var RotatingLog = require('rotating-log')
,   logfile     = 'logs/logs.log'
,   log         = RotatingLog(logfile, {keep: keep, maxsize: Math.round(maxSize) })

function checkRotations() {
	if (rotations >= keep) {
		console.log('There have been ', rotations, '. Quitting websocket.');
		ws.close();
	}
}

log.on('rotated', function () {
	console.log('The log file was rotated.')
	rotations++;
	checkRotations();
})

log.on('error', function (err) {
	console.error('There was an error: %s', err.message || err)
})
//log.write( 'data' )

console.log('Logging to ', logfile, ' max size = ', maxSize);
console.log('execute "tail -f %s" to watch log. press ctrl-c to exit.', logfile)
console.log('Starting: ', new Date());

var WebSocket = require('ws');
var ws = new WebSocket('wss://ws-sandbox.kraken.com');
ws.on('open', function() {
	console.log('Open');
	let subData = {
	  "event": "subscribe",
	  "pair": [
	    "LTC/USD"
	  ],
	  "subscription": {
	    "name": "ticker"
	  }
	};

	ws.send(JSON.stringify(subData));
});

ws.on('close', function() {
    console.log('disconnected');
    logStats();
	console.log('Rotations: ', rotations);
	console.log('Finished: ', new Date());
	process.exit(0);
});

ws.on('message', function(message) {
	console.log('received a message', message);
	var data;
	// try {
	// 	data = JSON.parse(message);
	// 	log.write(JSON.stringify(data));
	// } catch(e) {
	// 	console.log('There was an error parsing JSON', message);
	// }
});

function logStats() {
	console.log('Total: ', count);
}

setInterval(function() {
	logStats();
}, 1000);