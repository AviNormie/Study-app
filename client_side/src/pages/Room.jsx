import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const socket = io('https://study-app-api.onrender.com');

const Room = () => {
  const [peers, setPeers] = useState({});
  const userVideo = useRef();
  const peerConnections = useRef({});

  useEffect(() => {
    socket.emit('joinRoom', 'study-room');

    // Get user media
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        userVideo.current.srcObject = stream;

        socket.on('userJoined', ({ socketId }) => {
          console.log(`User joined: ${socketId}`);
          createOffer(socketId, stream);
        });

        socket.on('offer', (data) => {
          console.log(`Receiving offer from ${data.caller}`);
          createAnswer(data.caller, stream, data.sdp);
        });

        socket.on('answer', (data) => {
          peerConnections.current[data.answerer].setRemoteDescription(new RTCSessionDescription(data.sdp));
        });

        socket.on('ice-candidate', (data) => {
          peerConnections.current[data.sender].addIceCandidate(new RTCIceCandidate(data.candidate));
        });

        socket.on('userDisconnected', (socketId) => {
          if (peerConnections.current[socketId]) {
            peerConnections.current[socketId].close();
            delete peerConnections.current[socketId];
            setPeers((prev) => {
              const updatedPeers = { ...prev };
              delete updatedPeers[socketId];
              return updatedPeers;
            });
          }
        });
      });
  }, []);

  const createOffer = (target, stream) => {
    const peer = new RTCPeerConnection();
    stream.getTracks().forEach(track => peer.addTrack(track, stream));
    
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          target,
          candidate: event.candidate
        });
      }
    };
    
    peer.createOffer().then((offer) => {
      peer.setLocalDescription(offer);
      socket.emit('offer', { target, sdp: offer });
    });
    
    peerConnections.current[target] = peer;
  };

  const createAnswer = (caller, stream, sdp) => {
    const peer = new RTCPeerConnection();
    stream.getTracks().forEach(track => peer.addTrack(track, stream));

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          target: caller,
          candidate: event.candidate
        });
      }
    };

    peer.setRemoteDescription(new RTCSessionDescription(sdp));
    peer.createAnswer().then((answer) => {
      peer.setLocalDescription(answer);
      socket.emit('answer', { target: caller, sdp: answer });
    });

    peer.ontrack = (event) => {
      setPeers((prev) => ({
        ...prev,
        [caller]: {
          stream: event.streams[0],
          socketId: caller,
        }
      }));
    };

    peerConnections.current[caller] = peer;
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="z-10">
        <h1 className="text-3xl mb-4">Live Study Room</h1>
      </div>
      
      {/* Display the local user's video with smaller size */}
      <video ref={userVideo} autoPlay muted className="rounded-lg shadow-lg w-1/4 mb-4" />
      
      {/* Render the videos of all peers with smaller size */}
      <div className="flex flex-wrap justify-center space-x-4">
        {Object.keys(peers).map(socketId => (
          <div key={socketId} className="mb-4">
            <h3 className="text-white">{`User ${socketId}`}</h3>
            <video 
              autoPlay 
              muted={false} 
              ref={(videoElement) => {
                if (videoElement) {
                  videoElement.srcObject = peers[socketId].stream;
                }
              }} 
              className="rounded-lg shadow-lg w-1/4"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Room;
