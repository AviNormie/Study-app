import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { PuffLoader } from "react-spinners";

let socket; // Declare with let for reassignment

const Timer = () => {
  const [loading, setLoading] = useState(true); // Loader state
  const [socketId, setSocketId] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0); // Timer starts at 0 seconds
  const [isRunning, setIsRunning] = useState(false); // Tracks whether the timer is running
  const [users, setUsers] = useState([]); // List of users with their study times
  const [studyTime, setStudyTime] = useState(0); // Track studyTime for display
  const [userId, setUserId] = useState(localStorage.getItem('userId'));


  useEffect(() => {
    // Ensure socket is only initialized once
    if (!socket) {
      socket = io('http://localhost:3000'); // Connect to the Socket.IO server

      socket.on('connect', () => {
        console.log('Socket connected: ', socket.id);
        setSocketId(socket.id); // Store socket ID
      });
          // Listen for 'studyTimeUpdate' event from the backend
          socket.on('studyTimeUpdate', (data) => {
            // console.log('Received update:', data);
            if (data.userId === userId) {
              setStudyTime(data.studyTime);
            }
          });

      socket.on('message', (data) => {
        console.log(data);
      });
    }

    return () => {
      if (socket) {
        socket.disconnect();
        console.log('Socket disconnected');
        socket = null; // Reset socket to null after disconnect
      }
    };
  }, [userId]); // Empty dependency array ensures this runs only once


  useEffect(() => {
    // Fetch the previous study time for the user
    const fetchStudyTime = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/user/${userId}`);
        if (response.data && response.data.studyTime !== undefined) {
          setTimeElapsed(response.data.studyTime); // Set the timer to the saved time
        }
      } catch (error) {
        console.error('Error fetching study time:', error);
      }
    };
    if (userId) {
      fetchStudyTime();
    }
  }, [userId]); // Runs once on mount
  

  useEffect(() => {
    let timer;
    if (isRunning) {
      // Timer to increment time every second
      timer = setInterval(() => {
        setTimeElapsed((prev) => {
          const newTime = prev + 1;
          // Emit only when the time changes
          if (socketId && userId) {
            socket.emit('studyTimeUpdate', { userId, studyTime: newTime });
          }
          return newTime;
        });
      }, 1000); // Emit every second
    } else {
      clearInterval(timer);
    }

    return () => {
      clearInterval(timer); // Cleanup interval on unmount
    };
  }, [isRunning, socketId]); // Depend only on isRunning and socketId

  const handleStartPause = () => {
    setIsRunning(!isRunning); // Toggle the running state

    if (!isRunning) {
      socket?.emit('startTimer', { userId, timeElapsed }); // Notify server when timer starts
    } else {
      socket?.emit('pauseTimer', { userId, timeElapsed }); // Notify server when timer pauses
    }
  };

  const handleReset = () => {
    setIsRunning(false); // Stop the timer
    setTimeElapsed(0); // Reset the timer to 0
    socket?.emit('resetTimer', { userId }); // Notify server about reset
  };

  useEffect(() => {
    // Fetch users when the component mounts
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:3000/users'); // API to fetch user data
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false); // Hide loader
      }
    };

    fetchUsers();
  }, []); // Empty dependency ensures this runs once on mount

  return (
    <div className="flex flex-col items-center p-4">
      {socketId && <p>Connected Socket ID: {socketId}</p>}
      <h1 className="text-4xl font-bold mb-4">
        {Math.floor(timeElapsed / 60)}:{timeElapsed % 60 < 10 ? `0${timeElapsed % 60}` : timeElapsed % 60}
      </h1>
      <div className="flex space-x-4 mb-4">
        <button
          onClick={handleStartPause}
          className={`px-4 py-2 rounded text-white ${isRunning ? 'bg-red-500 hover:bg-red-700' : 'bg-green-500 hover:bg-green-700'}`}
        >
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700"
        >
          Reset
        </button>
      </div>
      <div className="w-full max-w-lg bg-gray-100 p-4 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Users' Study Times</h2>
        {loading ? (
         <div className="flex justify-center items-center">
         <PuffLoader color="#3498db" size={60} />
       </div> // Show loader when fetching users
        ) : users.length > 0 ? (
          <ul className="space-y-2">
            {users.map((user) => (
              <li key={user._id} className="flex justify-between bg-white p-2 rounded shadow">
                <span className="font-medium">{user.name}</span>
                <span className="font-medium">{user._id}</span>
                <span>
                {Math.floor(user.studyTime / 60)}:
                {user.studyTime % 60 < 10 ? `0${user.studyTime % 60}` : user.studyTime % 60}
                </span>
              </li>
            ))}   
          </ul>
        ) : (
          <p>No users found.</p> // Show this if no users are present
        )}
      </div>
    </div>
  );
};

export default Timer;
