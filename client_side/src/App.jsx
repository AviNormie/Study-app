import React from 'react'
import {BrowserRouter,Routes,Route} from 'react-router-dom'
// import SignUp from './pages/SignUp'
import Timer from './components/Timer';
// import Leaderboard from './components/Leaderboard';
import SignUp from './pages/SignUp';
import MainPage from './pages/MainPage';
import Login from './pages/Login';
import Room from './pages/Room';
function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/timer" element={<Timer />} />
          <Route path="/signup" element={<SignUp/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/room" element={<Room/>} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App