import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

let socket; // Global variable to prevent multiple connections

function MainPage() {
  const navigate = useNavigate();
  const [socketId, setSocketId] = useState(null);

  useEffect(() => {
    if (!socket) {
      socket = io('http://localhost:3000'); // Connect to the Socket.IO server

      socket.on('connect', () => {
        console.log('Socket connected: ', socket.id);
        setSocketId(socket.id); // Store socket ID
      });

      socket.on('message', (data) => {
        console.log(data);
      });
    }

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null; // Reset socket to null after disconnect
      }
    };
  }, [navigate]);

  return (
    <div className='items-center flex flex-col m-3 border   '>
      <h1>Welcome to the main page! Socket connection established.</h1>
      {socketId && <p>Connected Socket ID: {socketId}</p>}
      
      <h2>if not redirected to "/timer" route then add "/timer" to the url on the top</h2>
    </div>
  );
}

export default MainPage;
