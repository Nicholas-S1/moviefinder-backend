import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../App.jsx";
import { API_BASE_URL } from "../config.js";

export default function Movies() {
  const { currentUser } = useContext(UserContext);

  // State for movies, ratings, and search filters
  const [movies, setMovies] = useState([]);
  const [userRatings, setUserRatings] = useState({});
  const [q, setQ] = useState("");
  const [minYear, setMinYear] = useState("");
  const [minRating, setMinRating] = useState("");

  // Fetch all movies by default
  useEffect(() => {
    fetchMovies();
  }, []);

  // Fetch existing ratings if logged in
  useEffect(() => {
    if (!currentUser) return;
    fetch(`${API_BASE_URL}/users/${currentUser.user_id}/ratings`)
      .then((res) => res.json())
      .then((data) => {
        const map = {};
        data.forEach((r) => (map[r.movie_id] = r.rating));
        setUserRatings(map);
      })
      .catch(console.error);
  }, [currentUser]);

  // 🎬 Fetch movies (with optional filters)
  const fetchMovies = async () => {
    try {
      const url = `${API_BASE_URL}/api/movies?q=${encodeURIComponent(
      q
      )}&minYear=${minYear}&minRating=${minRating}`;  
      const res = await fetch(url);
      const data = await res.json();
      setMovies(data);
    } catch (err) {
      console.error("Error fetching movies:", err);
    }
  };

  // ⭐ Handle rating submission
  const handleRate = async (movieId, rating) => {
    if (!currentUser) return alert("Log in to rate movies");

    setUserRatings((prev) => ({ ...prev, [movieId]: rating })); // instant UI update

    await fetch(`${API_BASE_URL}/rate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: currentUser.user_id,
        movie_id: movieId,
        rating,
      }),
    });
  };

  // 🎥 Handle watch-later
  const handleWatchLater = async (movieId) => {
  if (!currentUser) return alert("Log in to save movies");
  await fetch(`${API_BASE_URL}/api/interactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: currentUser.user_id,
      movie_id: movieId,
      action: "watch_later",   // 👈 add this field
    }),
  });
  alert("🎥 Added to Watch Later!");
};

  // 🧭 Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchMovies();
  };

  return (
    <div className="page">
      <h2>Search Movies</h2>

      {/* 🔍 Search Bar */}
      <form onSubmit={handleSearch} style={searchStyle}>
        <input
          placeholder="Title..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={inputStyle}
        />
        <input
  type="text"
  inputMode="numeric"
  placeholder="Min Year"
  value={minYear}
  onChange={(e) => setMinYear(e.target.value.replace(/\D/g, ""))}
  style={inputStyle}


        />
        <input
          type="number"
          step="0.1"
          placeholder="Min Rating"
          value={minRating}
          onChange={(e) => setMinRating(e.target.value)}
          style={inputStyle}
        />
        <button type="submit" style={btnStyle}>
          Search
        </button>
      </form>

      {/* 🎬 Movie List */}
      {movies.length === 0 ? (
        <p>No movies found.</p>
      ) : (
        movies.map((m) => (
          <div key={m.movie_id} className="movie-card" style={cardStyle}>
            <div>
              <h3>{m.title}</h3>
              <p>
                {m.release_year} — ⭐ {m.imdb_rating || "N/A"}
              </p>
              <p style={{ fontSize: "0.9em", color: "#888" }}>
                {m.genre || "No genre listed"}
              </p>
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
                  onChange={(e) => handleRate(m.movie_id, e.target.value)}
                  style={inputStyle}
                />
                <button
                  onClick={() => handleWatchLater(m.movie_id)}
                  style={btnStyle}
                >
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

// 💅 Inline Styles
const cardStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: "1px solid #444",
  padding: "10px 0",
};

const searchStyle = {
  display: "flex",
  gap: "10px",
  marginBottom: "20px",
  alignItems: "center",
};

const actionStyle = {
  display: "flex",
  gap: "10px",
  alignItems: "center",
};

const inputStyle = {
  width: "120px",
  padding: "6px",
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
