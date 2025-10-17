import React, { useContext } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { UserContext } from '../App'

export default function NavBar() {
  const { currentUser, logout } = useContext(UserContext)
  const nav = useNavigate()

  const handleLogout = () => {
    logout()
    nav('/')
  }

  return (
    <nav className="navbar">
      <h1 className="logo">🎞️ Movie Finder</h1>
      <ul className="nav-links">
        <li><NavLink to="/" end className={({isActive}) => isActive ? 'active' : ''}>Home</NavLink></li>
        <li><NavLink to="/movies" className={({isActive}) => isActive ? 'active' : ''}>Movies</NavLink></li>
        <li><NavLink to="/recommendations" className={({isActive}) => isActive ? 'active' : ''}>Recommendations</NavLink></li>
        <li><NavLink to="/chart" className={({isActive}) => isActive ? 'active' : ''}>Genre Chart</NavLink></li>
        {currentUser ? (
          <>
            <li className="user-pill">👤 {currentUser.username}</li>
            <li><button className="linklike" onClick={handleLogout}>Logout</button></li>
          </>
        ) : (
          <>
            <li><NavLink to="/login" className={({isActive}) => isActive ? 'active' : ''}>Login</NavLink></li>
            <li><NavLink to="/signup" className={({isActive}) => isActive ? 'active' : ''}>Signup</NavLink></li>
          </>
        )}
      </ul>
    </nav>
  )
}
