import React from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div>
      <h2>Welcome to Movie Finder</h2>
      <p className="muted">Search movies, get director-based recommendations, and see your favorite genres.</p>
      <div className="inputs" style={{marginTop: '12px'}}>
        <Link to="/movies" className="btn">🎬 Browse Movies</Link>
        <Link to="/recommendations" className="btn">⭐ Recommendations</Link>
        <Link to="/chart" className="btn">📊 Your Genre Chart</Link>
      </div>
    </div>
  )
}
