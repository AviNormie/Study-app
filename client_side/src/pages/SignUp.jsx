import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    axios.post('https://study-app-api.onrender.com/sign-up', { name, email, password })
      .then(result => {
        console.log(result);
        setLoading(false);
        navigate('/login');
      })
      .catch(error => {
        setLoading(false);
        setError('Something went wrong! Please try again.');
        console.log(error);
      });
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-black to-purple-950 overflow-hidden flex justify-center items-center">
      {/* Background Blinking Dots */}
      <div ref={dotsContainerRef} className="absolute inset-0 pointer-events-none"></div>

      <form onSubmit={handleSubmit} method="post">
        <div className="w-96 h-auto bg-indigo-50 rounded-lg shadow-xl flex flex-col justify-between p-6">
          <h1 className="font-bold text-indigo-500 text-3xl text-center mb-6">Sign Up</h1>
          <fieldset className="border-4 border-dotted border-indigo-500 p-5">
            <legend className="px-2 italic -mx-2 text-indigo-500">Enter your details to sign up</legend>
            <label className="text-xs font-bold after:content-['*'] after:text-red-400" htmlFor="name">Name</label>
            <input
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 mb-2 mt-1 outline-none ring-none focus:ring-2 focus:ring-indigo-500"
              type="text"
              id="name"
              name="name"
              placeholder="Name"
              required
            />
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
              disabled={loading}
            >
              {loading ? 'Signing up...' : 'Sign Up'}
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

export default SignUp;
