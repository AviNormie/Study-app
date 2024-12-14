import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000'); // Update with your backend URL

const Timer = () => {
  const [timeElapsed, setTimeElapsed] = useState(0); // Timer starts at 0 seconds
  const [isRunning, setIsRunning] = useState(false); // Tracks whether the timer is running

  useEffect(() => {
    let timer;

    if (isRunning) {
      timer = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timer);
    }

    return () => clearInterval(timer); // Cleanup interval on unmount
  }, [isRunning]);

  const handleStartPause = () => {
    setIsRunning(!isRunning); // Toggle the running state

    if (!isRunning) {
      socket.emit('startTimer', { userId: 'user1', timeElapsed }); // Notify server when timer starts
    } else {
      socket.emit('pauseTimer', { userId: 'user1', timeElapsed }); // Notify server when timer pauses
    }
  };

  const handleReset = () => {
    setIsRunning(false); // Stop the timer
    setTimeElapsed(0); // Reset the timer to 0
    socket.emit('resetTimer', { userId: 'user1' }); // Notify server about reset
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-4xl font-bold">
        {Math.floor(timeElapsed / 60)}:{timeElapsed % 60 < 10 ? `0${timeElapsed % 60}` : timeElapsed % 60}
      </h1>
      <div className="flex space-x-4 mt-4">
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
    </div>
  );
};

export default Timer;
