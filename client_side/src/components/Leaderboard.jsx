import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000'); // Update with your server's URL

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    socket.on('updateLeaderboard', (data) => {
      setLeaderboard(data);
    });

    return () => socket.off('updateLeaderboard');
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
      <ul className="space-y-2">
        {leaderboard.map((user, index) => (
          <li key={user.userId} className="flex justify-between bg-gray-200 p-2 rounded">
            <span>{index + 1}. {user.userId}</span>
            <span>{Math.floor(user.studyDuration / 60)} min</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard;
