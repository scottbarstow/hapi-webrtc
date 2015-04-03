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
    register: require("./plugins/rest"), 
    options: {}
  },
  // { 
  //   register: require("./plugins/socketIO/socketio"), 
  //   options: {}
  // },
  {
    register: require("./plugins/matrixListener/listener"),
    options:{}
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
    console.log(request.path, request.query);
    return reply.continue();
});



server.start(function() {
  console.log("the server has started on host: " + server.info.host + " and port: " + server.info.port )
})