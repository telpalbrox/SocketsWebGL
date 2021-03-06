console.log("loading server...");
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var inited = false;
//var users = 0;
var objectsServer = [];

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

  socket.on('disconnect', function() {
    console.log('user disconnected');
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

    getConnectedIds(socket.id, function(soketid) {
      io.sockets.connected[soketid].emit('update object', object, index);
    });

  });

  socket.on('change object color', function(object, index) {
    if(object === undefined) {
      console.log('error al recibir el objeto');
      return;
    }

    objectsServer[index].color = { r: object.r, g: object.g, b: object.b };

    getConnectedIds(socket.id, function(soketid) {
      io.sockets.connected[soketid].emit('change object color', object, index);
    });
  });

  socket.on('create object', function(object) {
    objectsServer.push(object);
    getConnectedIds(socket.id, function(soketid) {
      io.sockets.connected[soketid].emit('create object', object);
    });
  });

  socket.on('delete object', function(index) {
    objectsServer.splice(index, 1);
    getConnectedIds(socket.id, function(soketid) {
        io.sockets.connected[soketid].emit('delete object', index);
    })
  });

});

http.listen(port, function() {
  console.log('Listening on port ' + port);
});

function getConnectedIds(clientId, callback) {
      for(var i in io.sockets.connected) {
      if(io.sockets.connected[i].id == clientId) {
        continue;
      }
      callback(io.sockets.connected[i].id);
    }
}
