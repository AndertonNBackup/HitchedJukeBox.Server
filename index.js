var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var redis = require('socket.io-redis');
var client = require('socket.io-client')('http://localhost:3000');
io.adapter(redis({ host: 'redis', port: 6379 }));

app.get('/', function(req, res){
    // res.sendFile(__dirname + '/index.html');
    res.sendStatus(404);
});

client.on('connect', () => {
  console.log(client.id); // 'G5p5...'
  // console.log(client);
  client.on('chat message', function(msg){
    console.log('Server Client Message Recieved: ' + msg);
  });
});

// io.on('connection', function(socket){
//   console.log('Client Connected: ' + socket.client.id);
//   // socket.on('server message', function(msg){
//   //   console.log('Message Recieved: ' + msg);
//   //   io.of('/').adapter.clients((err, clients) => {
//   //     console.log('Clients : ');
//   //     console.log(clients); // an array containing all connected socket ids
//   //   });
//   // });
// });

http.listen(3000, function(){
  console.log('listening on *:3000');
});