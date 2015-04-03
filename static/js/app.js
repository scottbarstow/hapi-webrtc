"use strict";
var socket = io();


var isChrome = !!navigator.webkitGetUserMedia;

var STUN = {
    url: isChrome 
       ? 'stun:stun.l.google.com:19302' 
       : 'stun:23.21.150.121'
};

var TURN = {
    url: 'turn:homeo@turn.bistri.com:80',
    credential: 'homeo'
};

var iceServers = {
   iceServers: [STUN, TURN]
};


var button = document.getElementById('create-connection');

socket.on("a test", function(msg){
  console.log("got message: " + msg)
})

button.onclick = function(){
  console.log("Clicked button")


  var MediaConstraints = {
      audio: true,
      video: true
  };
  navigator.webkitGetUserMedia(MediaConstraints, OnMediaSuccess, OnMediaError);

  function OnMediaError(error) {
      console.error(error);
  }

  function OnMediaSuccess(mediaStream) {
    console.log('got media')
    var selfView = document.getElementById('selfView');
    //attachMediaStream(selfView, mediaStream)
    selfView.src = URL.createObjectURL(mediaStream)
    var peer = new webkitRTCPeerConnection(iceServers);

    peer.onicecandidate = function(evt){
      if(evt.candidate){
        socket.emit('webrtc', JSON.stringify({'candidate':evt.candidate}))
      }
    };

    peer.onnegotiationneeded = function(evt){
    }
    
    peer.addStream(mediaStream);
    
    peer.onaddstream = function(mediaStream) {
        video.src = webkitURL.createObjectURL(mediaStream);
    };

    peer.onicecandidate = function(event) {
        var candidate = event.candidate;
        if(candidate) {
            socket.send({
                targetUser: 'target-user-id',
                candidate: candidate
            });
        }
    };
    
    // peer.createOffer(function(offerSDP) {
    //     peer.setLocalDescription(offerSDP);
    //     socket.send({
    //         targetUser: 'target-user-id',
    //         offerSDP: offerSDP
    //     });
    // }, onfailure, sdpConstraints);
  }
}






var DtlsSrtpKeyAgreement = {
   DtlsSrtpKeyAgreement: true
};

var optional = {
   optional: [DtlsSrtpKeyAgreement]
};