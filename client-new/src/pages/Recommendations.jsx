import React, { useState } from 'react'
import { API_URL } from '../App'

export default function Recommendations() {
  const [movieId, setMovieId] = useState('')
  const [movies, setMovies] = useState([])

  const fetchRecs = async () => {
    if (!movieId) return
    const res = await fetch(`${API_URL}/movies/${movieId}/similar-by-director`)
    const data = await res.json()
    setMovies(data)
  }

  return (
    <div>
      <h2>Recommendations (by Director)</h2>
      <div className="inputs">
        <input type="number" placeholder="Seed movie_id (e.g., 95)" value={movieId} onChange={e=>setMovieId(e.target.value)} />
        <button onClick={fetchRecs}>Get Similar</button>
      </div>

      {movies.map(m => {
        const genreText = m.genres || m.genre || 'Unknown'
        return (
          <div className="card" key={`${m.movie_id}-rec`}>
            <div><b>{m.title}</b> ({m.release_year}) — ⭐ {m.imdb_rating ?? 'N/A'}</div>
            <div className="muted">Genre: {genreText}</div>
          </div>
        )
      })}
    </div>
  )
}
