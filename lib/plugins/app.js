"use strict";
var path = require("path");

exports.register = function (server, options, next) {
  var staticDir = path.join(__dirname, "..", "..", "static");
  var io = server.plugins.hapio.io;

  server.route({
    method : "GET",
    path   : "/stuff/{id}",

    handler : function (request, reply) {
      reply.file(path.join(staticDir, "html", "index.html"));
    }
  });

  server.route({
    method: "GET",
    path: "/test/test",

    handler : function(request, reply){
      reply.view("name", {
        first: "Scott",
        last: "Barstow",
        mood: "Happy",
        age: "Old",
        colour: "Red"
      });
    }

  });

  server.route([
    {
      method: "GET", 
      path:"/canary",
      handler: function(request, reply){
        reply.view("canary/index.jade")
      }
    }, 
    {
      method: "GET",
      path: "/canary/messages",
      handler: function(request, reply){
        console.log("got message: " + request.query.message)
        reply({})
      }
    }
  ])

  //static files
  server.route({
    path    : "/static/{path*}",
    method  : "GET",
    config  : {
      auth : false
    },
    handler : {
      directory : {
        path    : staticDir,
        listing : false,
        index   : false
      }
    }
  });

  server.expose('test1', 'test it');

  next();
};

exports.register.attributes = {
  name : "app"
};