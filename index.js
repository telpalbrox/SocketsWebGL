var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var inited = false;
var users = 0;
var objectsServer;

var port = process.env.PORT || 3000;

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
      objectsServer = [];
    }
  });

  socket.on('update objects', function(objects) {
    objectsServer = objects;
    io.emit('update objects', objects);
  });

  socket.on('update object', function(object, index) {
    if(object === undefined) {
      console.log('error al recibir el objeto');
      return;
    }

    objectsServer[index].position.x = object.position.x;
    objectsServer[index].position.y = object.position.y;
    objectsServer[index].position.z = object.position.z;

    objectsServer[index].rotation._x = object.rotation._x;
    objectsServer[index].rotation._y = object.rotation._y;
    objectsServer[index].rotation._z = object.rotation._z;

    objectsServer[index].color = {r:object.color.r, g:object.color.g, b:object.color.b};
    io.emit('update object', object, index);
  });

  socket.on('create object', function(object) {
    objectsServer.push(object);
    io.emit('create object', object);
  });

  socket.on('delete object', function(index) {
    objectsServer.splice(index, 1);
    io.emit('delete object', index);
  });

});

http.listen(port, function() {
  console.log('Listening on port ' + port);
});
