"use strict";

exports.register = function(server, options, next){
  console.log("registering matrix listener")
  var matrix = require("matrix-js-sdk");
  var client = matrix.createClient("http://localhost:8008");
  var io = server.plugins.hapio.io;
  client.login("m.login.password", {"user":"test", "password":"password"}, function(err,res){
    if(err){
      console.log("Couldn't login to matrix: " + err.message);
    }else {
      client.credentials.accessToken = res.access_token;
      client.credentials.userId = res.user_id;
    }
    client.initialSync(8, function(err, msgs){
      if(err){
        console.error("initial sync")
      }
      console.log("last msg: " + msgs.end);

      var lastMsg = msgs.end;
      setInterval(function(){
        client.eventStream(lastMsg, 500, function(err, res){
          for(var i=0; i < res.chunk.length;i++)
          {
            io.emit("a test", res.chunk[i].type );
          }
          lastMsg = res.end;
        })
      }, 1000);
    })
  })
  next();
};


exports.register.attributes = {
  name : "matrix listener"
};