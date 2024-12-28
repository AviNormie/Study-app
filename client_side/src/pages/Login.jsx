import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// import { io } from 'socket.io-client';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Make the POST request to the backend
      const result = await axios.post('http://localhost:3000/login', { email, password });

      // If login is successful, store the userId in localStorage
      if (result.data.message === 'success') {
        localStorage.setItem('userId', result.data.userId);
        console.log('Login successful, userId stored:', result.data.userId);
        
        // Redirect to the timer page after successful login
        navigate('/timer');
      } else {
        // Handle invalid credentials
        setError('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login. Please try again.');
    }
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
