import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../App.jsx";
import { API_BASE_URL } from "../config.js";

export default function Movies() {
  const { currentUser } = useContext(UserContext);
  const [movies, setMovies] = useState([]);
  const [userRatings, setUserRatings] = useState({}); // { movie_id: rating }

  // Fetch movies (your existing logic here)
  useEffect(() => {
    fetch(`${API_BASE_URL}/movies`)
      .then(res => res.json())
      .then(setMovies)
      .catch(console.error);
  }, []);

  // Fetch existing ratings if logged in
  useEffect(() => {
    if (!currentUser) return;
    fetch(`${API_BASE_URL}/users/${currentUser.user_id}/ratings`)
      .then(res => res.json())
      .then((data) => {
        const map = {};
        data.forEach(r => { map[r.movie_id] = r.rating; });
        setUserRatings(map);
      })
      .catch(console.error);
  }, [currentUser]);

  // ⭐ Handle rating submission
  const handleRate = async (movieId, rating) => {
    if (!currentUser) return alert("Log in to rate movies");

    setUserRatings(prev => ({ ...prev, [movieId]: rating })); // instant UI update

    await fetch(`${API_BASE_URL}/rate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: currentUser.user_id, movie_id: movieId, rating }),
    });
  };

  // 🎥 Handle watch-later
  const handleWatchLater = async (movieId) => {
    if (!currentUser) return alert("Log in to save movies");
    await fetch(`${API_BASE_URL}/watchlater`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: currentUser.user_id, movie_id: movieId }),
    });
    alert("🎥 Added to Watch Later!");
  };

  return (
    <div className="page">
      <h2>Movies</h2>

      {movies.length === 0 ? (
        <p>Loading...</p>
      ) : (
        movies.map((m) => (
          <div key={m.movie_id} className="movie-card" style={cardStyle}>
            <div>
              <h3>{m.title}</h3>
              <p>
                {m.release_year} — ⭐ {m.imdb_rating || "N/A"}
              </p>
              <p style={{ fontSize: "0.9em", color: "#888" }}>{m.genre}</p>
            </div>

            {currentUser && (
              <div style={actionStyle}>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  value={userRatings[m.movie_id] || ""}
                  placeholder="Rate 0–10"
                  onChange={(e) =>
                    handleRate(m.movie_id, e.target.value)
                  }
                  style={inputStyle}
                />
                <button onClick={() => handleWatchLater(m.movie_id)} style={btnStyle}>
                  🎥 Watch Later
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

const cardStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: "1px solid #444",
  padding: "10px 0",
};

const actionStyle = {
  display: "flex",
  gap: "10px",
  alignItems: "center",
};

const inputStyle = {
  width: "80px",
  padding: "4px",
  borderRadius: "4px",
  border: "1px solid #555",
  background: "#222",
  color: "#fff",
};

const btnStyle = {
  background: "#3a86ff",
  color: "#fff",
  border: "none",
  padding: "6px 10px",
  borderRadius: "4px",
  cursor: "pointer",
};



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
