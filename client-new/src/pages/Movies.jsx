
import React, { useContext, useState } from 'react';
import { UserContext } from '../App.jsx'; // ✅ pull context from App
import { API_BASE_URL } from '../config.js'; // ✅ API URL stays here



export default function Movies() {
  const { currentUser } = useContext(UserContext)
  const [q, setQ] = useState('')
  const [minYear, setMinYear] = useState('')
  const [minRating, setMinRating] = useState('')
  const [movies, setMovies] = useState([])
  const [msg, setMsg] = useState('')

  const search = async () => {
    const url = `${API_BASE_URL}/movies?q=${encodeURIComponent(q)}&minYear=${minYear}&minRating=${minRating}`
    const res = await fetch(url)
    const data = await res.json()
    setMovies(data)
  }

  const likeMovie = async (movieId) => {
    if (!currentUser) return setMsg('Please log in first.')
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/interactions`, {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ user_id: currentUser.user_id, movie_id: movieId, action: 'like' })
    })
    const data = await res.json()
    setMsg(data.success ? 'Saved like!' : (data.error || 'Could not save like'))
  }

  const rateMovie = async (movieId) => {
    if (!currentUser) return setMsg('Please log in first.')
    const input = document.getElementById(`rate-${movieId}`)
    const val = parseFloat(input?.value)
    if (Number.isNaN(val) || val < 0 || val > 10) return setMsg('Enter a rating 0–10')
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/interactions`, {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ user_id: currentUser.user_id, movie_id: movieId, action: 'rate', rating: val })
    })
    const data = await res.json()
    setMsg(data.success ? 'Saved rating!' : (data.error || 'Could not save rating'))
  }

  const getSimilar = async (id) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/movies/similar/${id}`)
    const data = await res.json()
    setMovies(data)
    setMsg('Showing similar movies by director.')
  }

  return (
    <div>
      <h2>Movies</h2>
      <div className="inputs">
        <input placeholder="Title..." value={q} onChange={e=>setQ(e.target.value)} />
        <input type="number" placeholder="Min Year" value={minYear} onChange={e=>setMinYear(e.target.value)} />
        <input type="number" step="0.1" placeholder="Min Rating" value={minRating} onChange={e=>setMinRating(e.target.value)} />
        <button onClick={search}>Search</button>
      </div>

      {msg && <p className="muted">{msg}</p>}

      <div>
        {movies.map(m => {
          const genreText = m.genres || m.genre || 'Unknown'
          return (
            <div className="card" key={`${m.movie_id}-${m.title}`}>
              <div><b>{m.title}</b> ({m.release_year}) — ⭐ {m.imdb_rating ?? 'N/A'}</div>
              <div className="muted">Genre: {genreText}</div>
              <div className="inputs" style={{marginTop:'6px'}}>
                <button onClick={()=>getSimilar(m.movie_id)}>Similar by Director</button>
                {currentUser ? (
                  <>
                    <button onClick={()=>likeMovie(m.movie_id)}>👍 Like</button>
                    <label>Rate: <input id={`rate-${m.movie_id}`} type="number" min="0" max="10" step="0.5" style={{width:'80px'}} /></label>
                    <button onClick={()=>rateMovie(m.movie_id)}>Save Rating</button>
                  </>
                ) : (
                  <span className="muted">(Log in to like or rate)</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
