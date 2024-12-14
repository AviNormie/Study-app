import React from 'react'
import {BrowserRouter,Routes,Route} from 'react-router-dom'
// import SignUp from './pages/SignUp'
import Timer from './components/Timer';
// import Leaderboard from './components/Leaderboard';
import SignUp from './pages/SignUp';
import MainPage from './pages/MainPage';
import Login from './pages/Login';
function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/timer" element={<Timer />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login/>} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App