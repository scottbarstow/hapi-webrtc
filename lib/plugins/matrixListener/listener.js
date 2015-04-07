"use strict";

exports.register = function(server, options, next){
  console.log("registering matrix listener")
  var matrix = require("matrix-js-sdk");
  var client = matrix.createClient("http://localhost:8008");
  var io = server.plugins.hapio.io;

  var poll = function(lastMsg){
    client.eventStream(lastMsg, 600000, function(err, res){
      console.log("last msg: " + lastMsg);
      handleMessages(res.chunk);
      lastMsg = res.end;
      poll(lastMsg);
    })
  }

  var initialSync = function(){
    client.initialSync(8, function(err,msgs){
      poll(msgs.end)
    })
  }

  var handleMessages = function(msgs){
    for( var i =0;i< msgs.length;i++){
      console.log(JSON.stringify(msgs[i]));
      io.emit("fromMatrix", msgs[i]);
    }
  }

  client.login("m.login.password", {"user":"test", "password":"password"}, function(err,res){
    if(err){
      console.log("Couldn't login to matrix: " + err.message);
    }else {
      client.credentials.accessToken = res.access_token;
      client.credentials.userId = res.user_id;
    }

    initialSync();

    // client.initialSync(8, function(err, msgs){
    //   if(err){
    //     console.error("initial sync")
    //   }

    //   var lastMsg = msgs.end;
    //   poll(lastMsg);

    // })

    io.on("connection", function(socket){
      console.log("matrix listener connected")

      socket.on("robotNav", function(data){
        console.log("got nav: " + data);
        client.sendTextMessage("!mqMhGsOEzsdVXLbynu:matrix.rockethangar.com", JSON.stringify(data), function(err,res){
          if(err){
            console.log("Matrix error: " + JSON.stringify(err))
          }else {
            console.log("created event: " + res.event_id);
          }
        })
      });
    })
  })
  next();
};


exports.register.attributes = {
  name : "matrix"
};