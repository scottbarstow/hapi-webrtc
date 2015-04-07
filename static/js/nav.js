var socket = io();

$(function(){
  $("#navButtons").on('click', function(event){
    moveRobot({"command":"move", "direction": $(event.target).attr("value")})
  })
  var moveRobot = function(instruction){
    socket.emit("robotNav", instruction)
  }

});
