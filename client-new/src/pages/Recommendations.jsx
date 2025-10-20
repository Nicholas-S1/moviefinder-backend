import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../App.jsx";
import { API_BASE_URL } from "../config.js";

export default function Recommendations() {
  const { currentUser } = useContext(UserContext);
  const [recommendations, setRecommendations] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
  if (!selectedMovieId) return;
  fetch(`${API_BASE_URL}/api/movies/${selectedMovieId}/similar-by-director`)
    .then(res => res.json())
    .then(setRecommendations)
    .catch(console.error);
}, [selectedMovieId]);


    const fetchRecommendations = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/recommendations/${currentUser.user_id}`
        );
        if (!res.ok) throw new Error("Failed to fetch recommendations");
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) {
          setMsg("No recommendations yet — try liking or rating more movies!");
        } else {
          setRecommendations(data);
        }
      } catch (err) {
        console.error(err);
        setMsg("Could not load recommendations.");
      }
    };

    fetchRecommendations();
  }, [currentUser]);

  return (
    <div className="page">
      <h2>🎯 Your Movie Recommendations</h2>

      {msg && <p className="muted">{msg}</p>}

      {recommendations.length > 0 && (
        <div className="card-list">
          {recommendations.map((m) => (
            <div className="card" key={m.movie_id}>
              <b>{m.title}</b> ({m.release_year}) — ⭐ {m.imdb_rating ?? "N/A"}
              <div className="muted">
                Genre: {m.genre || m.genres || "Unknown"}
              </div>
              <div className="muted">
                Director: {m.director || "Unknown"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
