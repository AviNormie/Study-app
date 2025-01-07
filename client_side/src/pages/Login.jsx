import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Track loading state
  const dotsContainerRef = useRef(null); // Reference for dots container
  const navigate = useNavigate();

  useEffect(() => {
    const numDots = 80;
    const container = dotsContainerRef.current;
    const dots = [];

    // Create and add dots to the container
    for (let i = 0; i < numDots; i++) {
      const dot = document.createElement('div');
      dot.className = 'absolute w-2 h-2 bg-white rounded-full animate-blink';
      dot.style.left = `${Math.random() * 100}vw`;
      dot.style.top = `${Math.random() * 100}vh`;
      dot.style.animationDuration = `${Math.random() * 3 + 2}s`;
      container.appendChild(dot);
      dots.push(dot);
    }

    // Cleanup dots on component unmount
    return () => {
      dots.forEach(dot => dot.remove());
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading to true when login starts

    try {
      // Make the POST request to the backend
      const result = await axios.post('https://study-app-api.onrender.com/login', { email, password });

      // If login is successful, store the userId in localStorage
      if (result.data.message === 'success') {
        localStorage.setItem('userId', result.data.userId);
        localStorage.setItem('userName', result.data.userName);
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
    } finally {
      setLoading(false); // Set loading to false after request completes
    }
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-black to-purple-950 overflow-hidden flex justify-center items-center">
      {/* Background Blinking Dots */}
      <div ref={dotsContainerRef} className="absolute inset-0 pointer-events-none"></div>

      <form onSubmit={handleLogin} method="post">
        <div className="w-96 h-96 bg-indigo-50 rounded-lg shadow-xl flex flex-col justify-between p-6">
          <h1 className="font-bold text-indigo-500 text-3xl text-center mb-6">Welcome again!</h1>
          <fieldset className="border-4 border-dotted border-indigo-500 p-5">
            <legend className="px-2 italic -mx-2 text-indigo-500">Enter your details to login</legend>
            <label className="text-xs font-bold after:content-['*'] after:text-red-400" htmlFor="email">Mail</label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 mb-2 mt-1 outline-none ring-none focus:ring-2 focus:ring-indigo-500"
              type="email"
              id="email"
              name="email"
              placeholder="E-mail"
              required
            />
            <label className="text-xs font-bold after:content-['*'] after:text-red-400" htmlFor="password">Password</label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 mb-2 mt-1 outline-none ring-none focus:ring-2 focus:ring-indigo-500"
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              required
            />
            <button
              type="submit"
              className="w-full rounded bg-indigo-500 text-indigo-50 p-2 font-bold hover:bg-indigo-400"
              disabled={loading} // Disable button while loading
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </fieldset>
        </div>
      </form>

      {error && <div className="text-center ml-2 border-2 p-2 rounded-sm text-white mt-4">{error}</div>}

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
    </div>
  );
}

export default Login;
