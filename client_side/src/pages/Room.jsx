import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const socket = io('https://study-app-api.onrender.com');

const Room = () => {
  const [peers, setPeers] = useState({});
  const userVideo = useRef();
  const peerConnections = useRef({});
  const userStream = useRef();

  useEffect(() => {
    socket.emit('joinRoom', 'study-room');


    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        userVideo.current.srcObject = stream;
        userStream.current = stream;

        socket.on('userJoined', ({ socketId }) => {
          console.log(`User joined: ${socketId}`);
          createOffer(socketId, stream);
        });

        socket.on('offer', (data) => {
          console.log(`Receiving offer from ${data.caller}`);
          createAnswer(data.caller, stream, data.sdp);
        });

        socket.on('answer', (data) => {
          console.log(`Receiving answer from ${data.answerer}`);
          peerConnections.current[data.answerer].setRemoteDescription(
            new RTCSessionDescription(data.sdp)
          );
        });

        socket.on('ice-candidate', (data) => {
          console.log(`Receiving ICE candidate from ${data.sender}`);
          peerConnections.current[data.sender].addIceCandidate(
            new RTCIceCandidate(data.candidate)
          );
        });

        socket.on('userDisconnected', (socketId) => {
          console.log(`User disconnected: ${socketId}`);
          if (peerConnections.current[socketId]) {
            peerConnections.current[socketId].close();
            delete peerConnections.current[socketId];
            setPeers(prev => {
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
    peerConnections.current[target] = peer;

    // Add tracks to peer
    stream.getTracks().forEach(track => peer.addTrack(track, stream));

    // Handle ICE candidates
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          target,
          candidate: event.candidate,
        });
      }
    };

    // Handle remote tracks
    peer.ontrack = (event) => {
      console.log('Received remote track', event);
      setPeers(prev => ({
        ...prev,
        [target]: {
          stream: event.streams[0],
          socketId: target,
        },
      }));
    };

    // Create and send offer
    peer.createOffer().then(offer => {
      peer.setLocalDescription(offer);
      socket.emit('offer', { target, sdp: offer });
    });
  };

  const createAnswer = (caller, stream, sdp) => {
    const peer = new RTCPeerConnection();
    peerConnections.current[caller] = peer;

    // Add tracks to peer
    stream.getTracks().forEach(track => peer.addTrack(track, stream));

    // Handle ICE candidates
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          target: caller,
          candidate: event.candidate,
        });
      }
    };

    // Set remote description and create answer
    peer.setRemoteDescription(new RTCSessionDescription(sdp));
    peer.createAnswer().then(answer => {
      peer.setLocalDescription(answer);
      socket.emit('answer', { target: caller, sdp: answer });
    });

    // Handle remote tracks
    peer.ontrack = (event) => {
      setPeers(prev => ({
        ...prev,
        [caller]: {
          stream: event.streams[0],
          socketId: caller,
        },
      }));
    };
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-900">
      <div className="z-10 text-center mb-6">
        <h1 className="text-4xl font-semibold text-white">Live Study Room</h1>
        <p className="text-lg text-gray-300">Collaborate with others in real-time!</p>
      </div>

      {/* Display the local user's video */}
      <div className="mb-6">
        <h3 className="text-white text-lg mb-2">You</h3>
        <video ref={userVideo} autoPlay muted className="rounded-lg shadow-lg w-1/3" />
      </div>

      {/* Render peers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
        {Object.keys(peers).map(socketId => (
          <div key={socketId} className="text-center">
            <h3 className="text-white text-lg mb-2">{`User ${socketId}`}</h3>
            <video
              autoPlay
              ref={(videoElement) => {
                if (videoElement && peers[socketId]?.stream) {
                  videoElement.srcObject = peers[socketId].stream;
                }
              }}
              className="rounded-lg shadow-lg w-full max-w-xs mx-auto"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Room;
