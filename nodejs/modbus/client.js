var net = require('net');

var client = new net.Socket();
client.connect(501, '192.168.43.182', function() {
	console.log('Connected');
	var message = Buffer.from([0x01, 0x05, 0x00, 0x80, 0xFF, 0x00, 0x8D, 0xD2]);
	client.write(message);
});

client.on('data', function(data) {
	console.log('Received: ' + data);
	client.destroy(); // kill client after server's response
});

client.on('close', function() {
	console.log('Connection closed');
});