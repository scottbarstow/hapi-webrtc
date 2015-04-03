"use strict";

exports.register = function(server, options, next){
  console.log("registered socket.io")
  var io = require('socket.io')(server.listener);
  io.on('connection', function(socket){
    console.log("connected!");

    socket.on('message', function(msg){
      console.log('message: ' + msg);
    })

  }); 

  server.expose('io', io);
  next();
}

exports.register.attributes = {
  name: "Socket IO"
}