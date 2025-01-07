import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const socket = io('https://study-app-api.onrender.com');

const Room = () => {
  const [peers, setPeers] = useState({});
  const [isMuted, setIsMuted] = useState(true); // Mute state for audio
  const [isVideoOff, setIsVideoOff] = useState(true); // Mute state for video
  const userVideo = useRef();
  const peerConnections = useRef({});
  const userStream = useRef();

  useEffect(() => {
    socket.emit('joinRoom', 'study-room');

    // Get user media
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
    
    peer.ontrack = (event) => {
      setPeers((prev) => ({
        ...prev,
        [target]: {
          stream: event.streams[0],
          socketId: target,
        }
      }));
    };

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

  const toggleAudio = () => {
    const audioTrack = userStream.current.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  };

  const toggleVideo = () => {
    const videoTrack = userStream.current.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOff(!videoTrack.enabled);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-900">
      <div className="z-10 text-center mb-6">
        <h1 className="text-4xl font-semibold text-white">Live Study Room</h1>
        <p className="text-lg text-gray-300">Collaborate with others in real-time!</p>
      </div>
      
      {/* Display the local user's video with smaller size */}
      <div className="mb-6">
        <h3 className="text-white text-lg mb-2">You</h3>
        <video ref={userVideo} autoPlay muted className="rounded-lg shadow-lg w-1/3" />
      </div>
      
      {/* Controls for mute/unmute */}
      <div className="flex mb-6">
        <button
          onClick={toggleAudio}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-4"
        >
          {isMuted ? 'Unmute Audio' : 'Mute Audio'}
        </button>
        <button
          onClick={toggleVideo}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {isVideoOff ? 'Turn On Video' : 'Turn Off Video'}
        </button>
      </div>

      {/* Render the videos of all peers in a responsive grid layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
        {Object.keys(peers).map(socketId => (
          <div key={socketId} className="text-center">
            <h3 className="text-white text-lg mb-2">{`User ${socketId}`}</h3>
            <video 
              autoPlay 
              muted={false} 
              ref={(videoElement) => {
                if (videoElement) {
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
