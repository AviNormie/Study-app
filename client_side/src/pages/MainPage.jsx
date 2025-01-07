import React, { useEffect, useRef } from 'react';
import {useNavigate} from 'react-router-dom'

function MainPage() {
  const dotsContainerRef = useRef(null);
  const navigate = useNavigate();
  useEffect(() => {
    const numDots = 80;
    const container = dotsContainerRef.current;
    const dots = [];

    for (let i = 0; i < numDots; i++) {
      const dot = document.createElement('div');
      dot.className = 'absolute w-2 h-2 bg-purple-400 rounded-full animate-blink';
      dot.style.left = `${Math.random() * 100}vw`;
      dot.style.top = `${Math.random() * 100}vh`;
      dot.style.animationDuration = `${Math.random() * 3 + 2}s`;
      container.appendChild(dot);
      dots.push(dot);
    }

    return () => {
      dots.forEach(dot => dot.remove());
    };
  }, []);

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-black to-purple-950 overflow-hidden">
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

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-screen">
        <div className="text-center -mt-32"> {/* Adjust the -mt-32 to move it up */}
          <h1 className="text-5xl font-bold text-white mb-4">
            Welcome to STUDY-BUDDY !
          </h1>

          <div className="flex justify-between w-full mt-14 px-16 gap-10 ">
            <button onClick={()=>navigate('/signup')} class="group group-hover:before:duration-500 group-hover:after:duration-500 after:duration-500 hover:border-rose-300 hover:before:[box-shadow:_20px_20px_20px_30px_#a21caf] duration-500 before:duration-500 hover:duration-500 underline underline-offset-2 hover:after:-right-8 hover:before:right-12 hover:before:-bottom-8 hover:before:blur hover:underline hover:underline-offset-4  origin-left hover:decoration-2 hover:text-rose-300 relative bg-neutral-800 h-16 w-64 border text-left p-3 text-gray-50 text-base font-bold rounded-lg  overflow-hidden  before:absolute before:w-12 before:h-12 before:content[''] before:right-1 before:top-1 before:z-10 before:bg-violet-500 before:rounded-full before:blur-lg  after:absolute after:z-10 after:w-20 after:h-20 after:content['']  after:bg-rose-300 after:right-8 after:top-3 after:rounded-full after:blur-lg">
              New User?
            </button>
            <button onClick={()=>navigate('/login')} class="group group-hover:before:duration-500 group-hover:after:duration-500 after:duration-500 hover:border-rose-300 hover:before:[box-shadow:_20px_20px_20px_30px_#a21caf] duration-500 before:duration-500 hover:duration-500 underline underline-offset-2 hover:after:-right-8 hover:before:right-12 hover:before:-bottom-8 hover:before:blur hover:underline hover:underline-offset-4  origin-left hover:decoration-2 hover:text-rose-300 relative bg-neutral-800 h-16 w-64 border text-left p-3 text-gray-50 text-base font-bold rounded-lg  overflow-hidden  before:absolute before:w-12 before:h-12 before:content[''] before:right-1 before:top-1 before:z-10 before:bg-violet-500 before:rounded-full before:blur-lg  after:absolute after:z-10 after:w-20 after:h-20 after:content['']  after:bg-rose-300 after:right-8 after:top-3 after:rounded-full after:blur-lg">
              Existing User?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainPage;
