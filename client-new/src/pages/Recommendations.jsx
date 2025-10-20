import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config.js";

export default function Recommendations() {
  const [movieId, setMovieId] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState("");

  const fetchRecommendations = async () => {
    if (!movieId) {
      setError("Please enter a movie ID first.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/movies/${movieId}/similar-by-director`);
      if (!res.ok) throw new Error("Failed to fetch recommendations");
      const data = await res.json();
      setRecommendations(data);
      setError("");
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setError("Could not load recommendations.");
    }
  };

  return (
    <div className="page">
      <h2>🎬 Movie Recommendations</h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          fetchRecommendations();
        }}
        style={formStyle}
      >
        <input
          type="number"
          placeholder="Enter Movie ID"
          value={movieId}
          onChange={(e) => setMovieId(e.target.value)}
          style={inputStyle}
        />
        <button type="submit" style={btnStyle}>
          Get Recommendations
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {recommendations.length > 0 ? (
        <ul>
          {recommendations.map((m) => (
            <li key={m.movie_id} style={itemStyle}>
              <strong>{m.title}</strong> ({m.release_year}) — ⭐ {m.imdb_rating || "N/A"}
              <p style={{ fontSize: "0.9em", color: "#888" }}>{m.genres || "No genres"}</p>
            </li>
          ))}
        </ul>
      ) : (
        !error && <p>No recommendations yet. Try a different movie ID.</p>
      )}
    </div>
  );
}

const formStyle = {
  display: "flex",
  gap: "10px",
  marginBottom: "20px",
  alignItems: "center",
};

const inputStyle = {
  width: "150px",
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

const itemStyle = {
  borderBottom: "1px solid #444",
  padding: "6px 0",
};
