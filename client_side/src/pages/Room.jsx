import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom'
const socket = io('https://study-app-api.onrender.com');
const Room = () => {
  const [peers, setPeers] = useState({});
  const userVideo = useRef();
  const peerConnections = useRef({});
  const userStream = useRef();
  const navigate = useNavigate();
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

    return () => {
      // Clean up streams and peer connections
      if (userStream.current) {
        userStream.current.getTracks().forEach(track => track.stop());
      }
      Object.values(peerConnections.current).forEach(peer => peer.close());
      peerConnections.current = {};
    };
  }, []);

  const createOffer = (target, stream) => {
    const peer = new RTCPeerConnection();
    peerConnections.current[target] = peer;

    stream.getTracks().forEach(track => peer.addTrack(track, stream));

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          target,
          candidate: event.candidate,
        });
      }
    };

    peer.ontrack = (event) => {
      setPeers(prev => ({
        ...prev,
        [target]: {
          stream: event.streams[0],
          socketId: target,
        },
      }));
    };

    peer.createOffer().then(offer => {
      peer.setLocalDescription(offer);
      socket.emit('offer', { target, sdp: offer });
    });
  };

  const createAnswer = (caller, stream, sdp) => {
    const peer = new RTCPeerConnection();
    peerConnections.current[caller] = peer;

    stream.getTracks().forEach(track => peer.addTrack(track, stream));

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          target: caller,
          candidate: event.candidate,
        });
      }
    };

    peer.setRemoteDescription(new RTCSessionDescription(sdp));
    peer.createAnswer().then(answer => {
      peer.setLocalDescription(answer);
      socket.emit('answer', { target: caller, sdp: answer });
    });

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

  const leaveRoom = () => {
    // Notify the server and clean up local peer connections
    socket.emit('leaveRoom', 'study-room');
    if (userStream.current) {
      userStream.current.getTracks().forEach(track => track.stop());
    }
    Object.values(peerConnections.current).forEach(peer => peer.close());
    peerConnections.current = {};
    setPeers({});
    navigate('/timer')
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-900">
      <div className="z-10 text-center mb-6">
        <h1 className="text-4xl font-semibold text-white">Live Study Room</h1>
        <p className="text-lg text-gray-300">Collaborate with others in real-time!</p>
      </div>

      <div className="mb-6">
        <h3 className="text-white text-lg mb-2">You</h3>
        <video ref={userVideo} autoPlay muted className="rounded-lg shadow-lg w-1/3" />
      </div>

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

      <button
        onClick={leaveRoom}
        className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700"
      >
        Leave Room
      </button>
    </div>
  );
};

export default Room;
