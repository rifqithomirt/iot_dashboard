var net = require('net');
websocketConnection = null;
var WebSocketClient = require('websocket').client;
var client = new WebSocketClient();
client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});
client.on('connect', function(connection) {
	websocketConnection = connection;
    console.log('WebSocket Client Connected');
    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function() {
        console.log('echo-protocol Connection Closed');
    });
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log("Received: '" + message.utf8Data + "'");
        }
    });
});

client.connect('ws://192.168.43.75:8888/', 'echo-protocol');


var server = net.createServer();
server.on('close', function() {
    console.log('Server closed !');
});

server.on('connection', function(socket) {
    server.getConnections(function(error, count) {
        console.log('Number of concurrent connections to the server : ' + count);
    });

    socket.on('data', function(data) {
        console.log(Buffer.from(data));
        var bufferData = Buffer.from(data);
        var slaveId = bufferData.readInt8(0);
        var funcCode = bufferData.readInt8(1);
        var startRegister = bufferData.readInt16BE(2);
        var valueData = bufferData.readInt16BE(4);

        console.log( 'slaveId ' + slaveId);
        console.log( 'funcCode ' + funcCode);
        console.log( 'startRegister ' + startRegister);
        console.log( 'value ' + valueData);
        console.log( '----');

        if (websocketConnection.connected) {
            websocketConnection.sendUTF(JSON.stringify({
            	'slaveId' : slaveId,
            	'funcCode' : funcCode,
        		'startRegister' : startRegister,
        		'value' : valueData,
            }));
        }
        //echo data
        var is_kernel_buffer_full = socket.write('Data ::' + data);
        if (is_kernel_buffer_full) {
            //console.log('Data was flushed successfully from kernel buffer i.e written successfully!');
        } else {
            socket.pause();
        }

    });

    socket.on('drain', function() {
        console.log('write buffer is empty now .. u can resume the writable stream');
        socket.resume();
    });

    socket.on('error', function(error) {
        console.log('Error : ' + error);
    });

    socket.on('timeout', function() {
        console.log('Socket timed out !');
        socket.end('Timed out!');
        // can call socket.destroy() here too.
    });

    socket.on('end', function(data) {
        console.log('Socket ended from other end!');
        console.log('End data : ' + data);
    });

    socket.on('close', function(error) {
        var bread = socket.bytesRead;
        var bwrite = socket.bytesWritten;
        console.log('Bytes read : ' + bread);
        console.log('Bytes written : ' + bwrite);
        console.log('Socket closed!');
        if (error) {
            console.log('Socket was closed coz of transmission error');
        }
    });

});

server.on('error', function(error) {
    console.log('Error: ' + error);
});
server.maxConnections = 10;
server.listen(2222);
var islistening = server.listening;
if (islistening) {
    console.log('Server is listening');
} else {
    console.log('Server is not listening');
}

var trial = function(){
	if (websocketConnection.connected) {
            websocketConnection.sendUTF(JSON.stringify({
            	'slaveId' : 1,
            	'funcCode' : 2,
        		'startRegister' : 3,
        		'value' : 2,
            }));
            setTimeout(trial, 2000);
        }
}

setTimeout(trial, 2000);