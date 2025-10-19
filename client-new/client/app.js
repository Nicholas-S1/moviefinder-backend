// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Home from './pages/Home';
import Movies from './pages/Movies';
import Recommendations from './pages/Recommendations';
import Login from './pages/Login';
import Signup from './pages/Signup';
import GenreChart from './pages/GenreChart';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        {/* --- Global Navbar --- */}
        <nav className="navbar">
          <h1 className="logo">🎞️ Movie Finder</h1>
          <ul className="nav-links">
            <li><NavLink to="/" end>Home</NavLink></li>
            <li><NavLink to="/movies">Movies</NavLink></li>
            <li><NavLink to="/recommendations">Recommendations</NavLink></li>
            <li><NavLink to="/chart">Genre Chart</NavLink></li>
            <li><NavLink to="/login">Login</NavLink></li>
            <li><NavLink to="/signup">Signup</NavLink></li>
          </ul>
        </nav>

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
      </div>
    </Router>
  );
}

export default App;
