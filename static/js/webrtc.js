"use strict";

var RTCPeerConnection = null;
var RTCSessionDescription = null;
var RTCIceCandidate = null;
var getUserMedia = null;
var attachMediaStream = null;
var reattachMediaStream = null;
var webrtcDetectedBrowser = null;
var webrtcDetectedVersion = null;

function trace(text) {
  // This function is used for logging.
  if (text[text.length - 1] == '\n') {
    text = text.substring(0, text.length - 1);
  }
  console.log((performance.now() / 1000).toFixed(3) + ": " + text);
}


if(navigator.mozGetUserMedia){
  console.log("User is using firefox");

  webrtcDetectedBrowser = "firefox";

  webrtcDetectedVersion =
                  parseInt(navigator.userAgent.match(/Firefox\/([0-9]+)\./)[1]);

  RTCPeerConnection = mozRTCPeerConnection;
  RTCSessionDescription = mozRTCSessionDescription;
  RTCIceCandidate = mozRTCIceCandidate;

  getUserMedia = navigator.mozGetUserMedia.bind(navigator);

  // Creates iceServer from the url for FF.
  var createIceServer = function(url, username, password) {
    var iceServer = null;
    var url_parts = url.split(':');
    if (url_parts[0].indexOf('stun') === 0) {
      // Create iceServer with stun url.
      iceServer = { 'url': url };
    } else if (url_parts[0].indexOf('turn') === 0 &&
               (url.indexOf('transport=udp') !== -1 ||
                url.indexOf('?transport') === -1)) {
      // Create iceServer with turn url.
      // Ignore the transport parameter from TURN url.
      var turn_url_parts = url.split("?");
      iceServer = { 'url': turn_url_parts[0],
                    'credential': password,
                    'username': username };
    }
    return iceServer;
  };

  // Attach a media stream to an element.
  var attachMediaStream = function(element, stream) {
    console.log("Attaching media stream");
    element.mozSrcObject = stream;
    element.play();
  };

  var reattachMediaStream = function(to, from) {
    console.log("Reattaching media stream");
    to.mozSrcObject = from.mozSrcObject;
    to.play();
  };

  // Fake get{Video,Audio}Tracks
  MediaStream.prototype.getVideoTracks = function() {
    return [];
  };

  MediaStream.prototype.getAudioTracks = function() {
    return [];
  };

}else {
  console.log("its not firefox")
}