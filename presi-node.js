var connect = require('connect'),
	http = require('http');

var app = connect().use(connect.static(__dirname + '/public'));
var server = http.createServer(app);
var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
  socket.emit('welcome', { message: 'Welcome to Presi' });

  socket.on('join channel', function (channel) {
      console.log('Joining channel' + channel);
      socket.join(channel);
  })

  socket.on('issueCommand', function(data) {
    console.log('Sending data: ' + data);
    io.sockets.in(data.channel).emit('command', data);
  });
});

server.listen(8080); // make sure you have no Tomcat running!