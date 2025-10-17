import React, { useState, useMemo } from 'react'
import { Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import Home from './pages/Home'
import Movies from './pages/Movies'
import Recommendations from './pages/Recommendations'
import Login from './pages/Login'
import Signup from './pages/Signup'
import GenreChart from './pages/GenreChart'

export const API_URL = 'http://localhost:5000/api'

export const UserContext = React.createContext(null)

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser')
    return saved ? JSON.parse(saved) : null
  })

  const ctx = useMemo(() => ({
    currentUser,
    login(u) { setCurrentUser(u); localStorage.setItem('currentUser', JSON.stringify(u)) },
    logout() { setCurrentUser(null); localStorage.removeItem('currentUser') }
  }), [currentUser])

  return (
    <UserContext.Provider value={ctx}>
      {/* Global navbar shown on ALL pages */}
      <NavBar />
      <div className="page-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/chart" element={<GenreChart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
    </UserContext.Provider>
  )
}
