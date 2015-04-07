"use strict";

var getUserMedia = null;
var RTCPeerConnection = null;
var RTCSessionDescription = null;
var RTCIceCandidate = null;
var peer = null;

var isChrome = !!navigator.webkitGetUserMedia;

var STUN = {
    url: isChrome 
       ? 'stun:stun.l.google.com:19302' 
       : 'stun:23.21.150.121'
};

var iceServers = {
   iceServers: [STUN]
};

var socket = io();

socket.on("onWebRtcEvent", function(event){
  console.log("got event " + event.type)
  switch (event.type){
    case "candidate" :
      peer.addIceCandidate(new RTCIceCandidate(event.candidate))
      break;
    case "sdp" : 
      peer.setRemoteDescription(new RTCSessionDescription(event.sdp))
      peer.createAnswer(function(desc){
        peer.setLocalDescription(desc);
        socket.emit("webrtcEvent", {"type":"sdpRemote", "sdp": desc});
      }, function() {
        console.log("## Error with description ")
      });
      break;
    case "sdpRemote" :
      peer.setRemoteDescription( new RTCSessionDescription(event.sdp))
      break;
  }
});

socket.on("fromMatrix", function(data){
  console.log("got matrix event: " + JSON.stringify(data));
})

var createButton = document.getElementById('create-connection');
createButton.onclick = startCall;
//setupConnection();


function setupConnection() {
  var MediaConstraints = {
      audio: false,
      video: true
  };

  var attachMediaStream = function(element, stream){
    element.mozSrcObject = stream;
    element.play();
  }

  if(navigator.mozGetUserMedia){
    getUserMedia = navigator.mozGetUserMedia.bind(navigator);
    RTCPeerConnection = mozRTCPeerConnection;
    RTCSessionDescription = mozRTCSessionDescription;
    RTCIceCandidate = mozRTCIceCandidate;
  }else {
    getUserMedia = navigator.webkitGetUserMedia.bind(navigator)
  }
  getUserMedia(MediaConstraints, OnMediaSuccess, OnMediaError);

  function OnMediaError(error) {
      console.error(error);
  }



  function OnMediaSuccess(mediaStream) {
    var selfView = document.getElementById('selfView');
    attachMediaStream(selfView, mediaStream);
    peer = new RTCPeerConnection(iceServers);
    peer.addStream(mediaStream);

    peer.onnegotiationneeded = function(evt){
    }
    
    peer.onaddstream = function(evt) {
      console.log("stream added");
      var remoteView = document.getElementById('remoteView')
      attachMediaStream(remoteView, evt.stream);
      //remoteView.src = URL.createObjectURL(evt.stream);
    };

    peer.onicecandidate = function(event) {
      var candidate = event.candidate;
      if(candidate) {
          socket.emit("webrtcEvent", {
            "type": "candidate",
            candidate: candidate
          });
      }
    };
  }
}

function startCall() {
  peer.createOffer(function(desc){
    peer.setLocalDescription(desc);
    socket.emit("webrtcEvent", {"type":"sdp", "sdp":desc});
  }, function(){
    console.log("error creating offer")
  });
}

