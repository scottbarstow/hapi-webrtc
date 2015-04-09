"use strict";
var Path = require("path")
var Hapi     = require("hapi");
var Routes  = require('./routes')
var server = module.exports = new Hapi.Server();

server.connection({
  host : process.env.HOST,
  port : process.env.PORT
});


server.views({
  engines:{
    jade: require("jade"),
  },
  path: Path.join(__dirname, "views")
})

server.register(
  require('hapi-auth-cookie'), function(err){
    if(err){console.log(err);};

    //set auth strategy
    server.auth.strategy('session', 'cookie', {
      password:'worldofwalmart',
      cookie: 'session',
      redirectTo: false, 
      isSecure: false, 
      ttl: 24* 60 * 60 * 1000 
    })
  }
  // {
  //   register : require("./plugins/rest")
  // }
);
server.register([
  {
    register: require('hapio'),
    options:{}
  },

  { 
    register: require("./plugins/app"), 
    options: {}
  }
], function(err){
  if(err){
    console.error("error registering plugin: ", err)
  }
}
  // require("./plugins/matrixListener/listener"), function(err){
  //   if(err){console.log(err)};
  // }
);

server.route(Routes.endpoints);

server.ext('onRequest', function (request, reply) {
    console.log("Got request: " + request.path, request.query);
    return reply.continue();
});

var clients = {};
var io = server.plugins.hapio.io;

io.on("connection", function(socket){
  console.log("client connected: " + socket.id);
  clients[socket.id] = {
    id: socket.id,
    ip: socket.handshake.address.address,
    socket: socket
  }

  socket.on("webrtcEvent", function(event){
    console.log("got webrtc client event: " + JSON.stringify(event))
    for(var i in clients){
      console.log("emitting event from " + i + " and socket id is : " + socket.id)
      console.log("client: " + clients[i].id)
      if(socket.id != i){
        clients[i].socket.emit("onWebRtcEvent", event)
      }
    }
  })

  socket.on("disconnect", function() {
    console.log("disconnecting")
    clients[socket.id] = undefined;
    delete clients[socket.id];
  })
})





server.start(function() {
  console.log("the server has started on host: " + server.info.host + " and port: " + server.info.port )
})