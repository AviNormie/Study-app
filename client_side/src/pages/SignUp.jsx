import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    axios.post('https://study-app-api.onrender.com/sign-up', { name, email, password })
      .then(result => {
        console.log(result);
        navigate('/login');
      })
      .catch(error => console.log(error));
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-black to-purple-950 overflow-hidden flex justify-center items-center">
      {/* Background Blinking Dots */}
      <div ref={dotsContainerRef} className="absolute inset-0 pointer-events-none"></div>

      <form onSubmit={handleSubmit} method="post">
        <div className="flex flex-col shadow-2xl bg-slate-50 gap-2 border-[2px] border-coral-red pt-32 pb-32 pl-24 pr-24 rounded-lg">
          <h1 className="font-bold text-coral-red text-3xl text-center">Enter your details to Sign Up</h1>
          <input
            onChange={(e) => setName(e.target.value)}
            className="flex border-[3px] bg-slate-100 border-coral-red rounded-sm p-3 w-full"
            type="text"
            placeholder="Name"
            name="name"
            required
          />
          <input
            onChange={(e) => setEmail(e.target.value)}
            className="flex border-[3px] bg-slate-100 border-coral-red rounded-sm p-3 w-full"
            type="email"
            placeholder="E-mail"
            name="email"
            required
          />
          <input
            onChange={(e) => setPassword(e.target.value)}
            className="flex border-[3px] bg-slate-100 border-coral-red rounded-sm p-3 w-full"
            type="password"
            placeholder="Password"
            name="password"
            required
          />
          <button
            type="submit"
            className="border bg-green-500 text p-2 font-bold text-xl hover:bg-green-600"
          >
            Sign Up
          </button>
        </div>
      </form>

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
