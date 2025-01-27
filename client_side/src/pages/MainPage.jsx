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
          <h1 className="text-2xl sm:text-5xl font-bold text-white/90  mb-4">
            Welcome to StudySync !
          </h1>

          <div className="flex flex-col sm:flex-row justify-between w-full mt-14 px-6 sm:px-16 gap-6 sm:gap-10">
            <button
              onClick={() => navigate('/signup')}
              className="group group-hover:before:duration-500 group-hover:after:duration-500 after:duration-500 hover:border-rose-300 hover:before:[box-shadow:_20px_20px_20px_30px_#a21caf] duration-500 before:duration-500 hover:duration-500 underline underline-offset-2 hover:after:-right-8 hover:before:right-12 hover:before:-bottom-8 hover:before:blur hover:underline hover:underline-offset-4 origin-left hover:decoration-2 hover:text-rose-300 relative bg-neutral-800 h-14 sm:h-16 w-full sm:w-64 border text-left p-3 text-gray-50 text-sm sm:text-base font-bold rounded-lg overflow-hidden before:absolute before:w-8 sm:before:w-12 before:h-8 sm:before:h-12 before:content[''] before:right-1 before:top-1 before:z-10 before:bg-violet-500 before:rounded-full before:blur-lg after:absolute after:z-10 after:w-16 sm:after:w-20 after:h-16 sm:after:h-20 after:content[''] after:bg-rose-300 after:right-8 after:top-3 after:rounded-full after:blur-lg"
            >
              New User?
            </button>
            <button
              onClick={() => navigate('/login')}
              className="group group-hover:before:duration-500 group-hover:after:duration-500 after:duration-500 hover:border-rose-300 hover:before:[box-shadow:_20px_20px_20px_30px_#a21caf] duration-500 before:duration-500 hover:duration-500 underline underline-offset-2 hover:after:-right-8 hover:before:right-12 hover:before:-bottom-8 hover:before:blur hover:underline hover:underline-offset-4 origin-left hover:decoration-2 hover:text-rose-300 relative bg-neutral-800 h-14 sm:h-16 w-full sm:w-64 border text-left p-3 text-gray-50 text-sm sm:text-base font-bold rounded-lg overflow-hidden before:absolute before:w-8 sm:before:w-12 before:h-8 sm:before:h-12 before:content[''] before:right-1 before:top-1 before:z-10 before:bg-violet-500 before:rounded-full before:blur-lg after:absolute after:z-10 after:w-16 sm:after:w-20 after:h-16 sm:after:h-20 after:content[''] after:bg-rose-300 after:right-8 after:top-3 after:rounded-full after:blur-lg"
            >
              Existing User?
            </button>
          </div>
            {/* <p className='text-4xl mb-12 text-white mt-10' >What we do</p>
            <div className='w-full  flex justify-between mt-4  text-white text-3xl gap-2 '>
              <div className='flex justify-center border border-white px-4 py-2 max-w-[200px] break-all hover:scale-125 transition-transform duration-300 ease-in-out'>
                hiiiiihixlongtextthatexc
              </div>
              <div className='flex justify-center border border-white px-4 py-2 max-w-[200px] break-all hover:scale-125 transition-transform duration-300 ease-in-out'>
                hellohiiiiihixlongtextth
              </div>
              <div className='flex justify-center border border-white px-4 py-2 max-w-[200px] break-all hover:scale-125 transition-transform duration-300 ease-in-out'>
                haduh
              </div>
            </div> */}
        </div>
      </div>
    </div>
  );
}

export default MainPage;
