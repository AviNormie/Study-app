import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { PuffLoader } from "react-spinners";

let socket;

const Timer = () => {
  const [loading, setLoading] = useState(true);
  const [socketId, setSocketId] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [timerLoading, setTimerLoading] = useState(true);
  const [userName, setUserName] = useState(localStorage.getItem('userName') || 'User');
  const newUserName=userName.toUpperCase();
  const dotsContainerRef = useRef(null);
  
  useEffect(() => {
    if (!socket) {
      socket = io('https://study-app-api.onrender.com');

      socket.on('connect', () => {
        setSocketId(socket.id);
      });

      socket.on('studyTimeUpdate', (data) => {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === data.userId ? { ...user, studyTime: data.studyTime } : user
          )
        );
      });
    }

    return () => {
      socket.on('disconnect', () => {
        setTimeout(() => {
          socket.connect();
        }, 1000);
      });
    };
  }, [userId]);

  useEffect(() => {
    const fetchStudyTime = async () => {
      setTimerLoading(true);
      try {
        const response = await axios.get(`https://study-app-api.onrender.com/user/${userId}`);
        if (response.data && response.data.studyTime !== undefined) {
          setTimeElapsed(response.data.studyTime);
        }
      } catch (error) {
        console.error('Error fetching study time:', error);
      } finally {
        setTimerLoading(false);
      }
    };
    if (userId) {
      fetchStudyTime();
    }
  }, [userId]);

  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => {
        setTimeElapsed((prev) => {
          const newTime = prev + 1;
          if (socketId && userId) {
            socket.emit('studyTimeUpdate', { userId, studyTime: newTime });
          }
          return newTime;
        });
      }, 1000);
    } else {
      clearInterval(timer);
    }

    return () => clearInterval(timer);
  }, [isRunning, socketId]);

  const handleStartPause = () => {
    setIsRunning(!isRunning);
    if (!isRunning) {
      socket?.emit('startTimer', { userId, timeElapsed });
    } else {
      socket?.emit('pauseTimer', { userId, timeElapsed });
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeElapsed(0);
    socket?.emit('resetTimer', { userId });
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('https://study-app-api.onrender.com/users');
        setUsers(response.data.sort((a, b) => b.studyTime - a.studyTime));
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Create static dots for the background
  useEffect(() => {
    if (dotsContainerRef.current && dotsContainerRef.current.childNodes.length === 0) {
      for (let i = 0; i < 80; i++) {
        const dot = document.createElement('div');
        dot.className = 'absolute rounded-full bg-white animate-blink';
        dot.style.top = `${Math.random() * 100}%`;
        dot.style.left = `${Math.random() * 100}%`;
        dot.style.width = `${Math.random() * 3 + 2}px`;
        dot.style.height = `${Math.random() * 3 + 2}px`;
        dot.style.animationDuration = `${Math.random() * 3 + 2}s`;
        dot.style.animationDelay = `${Math.random() * 5}s`;
        dotsContainerRef.current.appendChild(dot);
      }
    }
  }, []);

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-black to-purple-900 overflow-hidden">
      <div ref={dotsContainerRef} className="absolute inset-0 pointer-events-none"></div>
  
      <style>
        {`
          @keyframes blink {
            0%, 100% { opacity: 0; }
            50% { opacity: 1; }
          }
          .animate-blink {
            animation: blink infinite;
          }
        `}
      </style>
  
      {/* Navbar */}
      <nav className="absolute top-0 left-0 right-0 z-10 bg-transparent text-white py-4">
        <div className="container mx-auto flex  justify-between items-center px-4">
          <h1 className="text-4xl font-bold">Let's Study, {newUserName}!</h1>
          <p className="text-sm">Socket ID: {socketId || 'Connecting...'}</p>
        </div>
      </nav>
  
      {/* Main Section */}
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-center mt-24 p-6 space-y-8 md:space-y-0">
  
        {/* Timer Section */}
        <div className="  mr-1  w-full md:w-1/2 bg-gradient-to-r from-purple-800 to-indigo-800 p-8 rounded-lg shadow-lg bg-opacity-80">
          <h1 className="flex justify-center text-3xl font-semibold mb-4 text-white">Your Timer</h1>
          {timerLoading ? (
            <div className="flex justify-center items-center h-40">
              <PuffLoader color="#8b5cf6" size={100} />
            </div>
          ) : (
            <h1 className="text-6xl font-extrabold text-center text-white border-4 border-transparent bg-clip-border bg-gradient-to-l from-purple-800 to-indigo-800 rounded-3xl p-4">
              {Math.floor(timeElapsed / 60)}:{timeElapsed % 60 < 10 ? `0${timeElapsed % 60}` : timeElapsed % 60}
            </h1>
          )}
  
          <div className="flex justify-center space-x-6 mt-6">
            <button
              onClick={handleStartPause}
              className={`px-6 py-3 rounded-lg text-lg font-medium text-white ${isRunning ? 'bg-red-500' : 'bg-green-500'}`}
            >
              {isRunning ? 'Pause' : 'Start'}
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg"
            >
              Reset
            </button>
          </div>
        </div>
  
        {/* Leaderboard Section */}
        <div className=" ml-1 w-full md:w-1/2 bg-gradient-to-r from-purple-800 to-indigo-800 p-8 rounded-lg shadow-lg bg-opacity-80">
          <h1 className="text-3xl flex justify-center font-semibold mb-4 text-white">Leaderboard</h1>
          {loading ? (
            <PuffLoader color="#8b5cf6" size={80} />
          ) : (
            <ul className="divide-y divide-gray-300">
              {users.map((user, index) => (
                <li key={user._id} className="flex justify-between p-4">
                  <span className="text-white">{index + 1}. {user.name}</span>
                  <span className="text-white">
                    {Math.floor(user.studyTime / 60)}:{user.studyTime % 60 < 10 ? `0${user.studyTime % 60}` : user.studyTime % 60}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
  
};

export default Timer;
