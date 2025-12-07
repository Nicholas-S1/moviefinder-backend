import React, { useEffect, useState, useContext } from "react";
import UserContext from "../context/userContext";

import { API_BASE_URL } from "../config.js";

export default function WatchLater() {
  const { currentUser } = useContext(UserContext);
  const [list, setList] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    fetch(`${API_BASE_URL}/api/users/${currentUser.user_id}/watchlater`)
      .then(res => res.json())
      .then(setList)
      .catch(console.error);
  }, [currentUser]);

  const handleRemove = async (movieId) => {
    if (!currentUser) return alert("Log in first!");
    await fetch(`${API_BASE_URL}/api/users/${currentUser.user_id}/watchlater/${movieId}`, {
      method: "DELETE",
    });
    // Optimistically update the UI
    setList(list.filter((m) => m.movie_id !== movieId));
  };

  if (!currentUser) return <p>Log in to see your Watch Later list.</p>;

  return (
    <div className="page">
      <h2>🎥 Watch Later</h2>
      {list.length === 0 ? (
        <p>No saved movies yet.</p>
      ) : (
        <ul>
          {list.map((m) => (
            <li key={m.movie_id} style={itemStyle}>
              <span>{m.title} ({m.release_year}) — ⭐ {m.imdb_rating}</span>
              <button onClick={() => handleRemove(m.movie_id)} style={btnStyle}>
                ❌ Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const itemStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: "1px solid #444",
  padding: "6px 0",
};

const btnStyle = {
  background: "#ff4757",
  color: "#fff",
  border: "none",
  padding: "4px 8px",
  borderRadius: "4px",
  cursor: "pointer",
};
