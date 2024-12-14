import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    axios.post('http://localhost:3000/login', { email, password })
      .then(result => {
        console.log('Login successful', result);
        // Redirect to the main page after successful login
        navigate('/timer');

        // Establish Socket.IO connection after login
      //   const socket = io('http://localhost:3000');
      //   socket.emit('user_connected', { userId: result.data.userId });

      //   // You can store socket connection or user data if needed
      //   socket.on('message', (data) => {
      //     console.log(data); // Handle incoming messages
      //   });
      // })
      // .catch(error => {
      //   console.log('Login error:', error);
      //   setError('Invalid credentials');
      });
  };

  return (
    <div className="flex h-screen justify-center items-center">
      <form onSubmit={handleLogin} method="post">
        <div className="flex flex-col shadow-2xl bg-slate-50 gap-2 border-[2px] border-coral-red pt-32 pb-32 pl-24 pr-24 rounded-lg">
          <h1 className="font-bold text-coral-red text-3xl">Enter your details to Login</h1>
          <input
            onChange={(e) => setEmail(e.target.value)}
            className="flex border-[3px] bg-slate-100 border-coral-red rounded-sm p-3 w-full"
            type="email"
            placeholder="E-mail"
            name="email"
          />
          <input
            onChange={(e) => setPassword(e.target.value)}
            className="flex border-[3px] bg-slate-100 border-coral-red rounded-sm p-3 w-full"
            type="password"
            placeholder="Password"
            name="password"
          />
          <button type="submit" className="border bg-green-500 text p-2 font-bold text-xl">
            Login
          </button>
        </div>
      </form>
      {error && <div>{error}</div>}
    </div>
  );
}

export default Login;
