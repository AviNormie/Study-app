import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Timer from './components/Timer';
import SignUp from './pages/SignUp';
import MainPage from './pages/MainPage';
import Login from './pages/Login';
import { Analytics } from "@vercel/analytics/react";
import Room from './pages/Room';

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/timer" element={<Timer />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/room" element={<Room />} />
        </Routes>
      </BrowserRouter>

      <Analytics />
    </div>
  );
}

export default App;
