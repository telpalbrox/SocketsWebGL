var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var inited = false;
var users = 0;
var objectsServer;

app.use(express.static(__dirname + '/public'));

app.get('/connect', function(req, res) {
  if(!inited) {
    inited = true;
    res.send(true);
  } else {
    res.send(false);
  }
});

app.get('/objects', function(req, res) {
  res.json(objectsServer);
});

io.on('connection', function(socket) {
  console.log('a user connected');
  users++;
  socket.on('disconnect', function() {
    console.log('user disconnected');
    users--;
    if(users == 0) {
      inited = false;
      objects = [];
    }
  });

  socket.on('update objects', function(objects) {
    objectsServer = objects;
    io.emit('update objects', objects);
  });

  socket.on('update object', function(object, index) {
    objectsServer[index].position.x = object.position.x;
    objectsServer[index].position.y = object.position.y;
    objectsServer[index].position.z = object.position.z;

    objectsServer[index].rotation._x = object.rotation._x;
    objectsServer[index].rotation._y = object.rotation._y;
    objectsServer[index].rotation._z = object.rotation._z;

    io.emit('update object', object, index);
  });
});

http.listen(3000, function() {
  console.log('litenig on *:3000');
});
