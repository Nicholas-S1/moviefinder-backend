import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../App.jsx";
import { API_BASE_URL } from "../config.js";

export default function WatchLater() {
  const { currentUser } = useContext(UserContext);
  const [list, setList] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    fetch(`${API_BASE_URL}/users/${currentUser.user_id}/watchlater`)
      .then(res => res.json())
      .then(setList)
      .catch(console.error);
  }, [currentUser]);

  if (!currentUser) return <p>Log in to see your Watch Later list.</p>;
const handleRemove = async (movieId) => {
  if (!currentUser) return alert("You must be logged in.");

  try {
    const res = await fetch(
      `${API_BASE_URL}/api/users/${currentUser.user_id}/watchlater/${movieId}`,
      { method: "DELETE" }
    );

    if (res.ok) {
      setList((prev) => prev.filter((m) => m.movie_id !== movieId));
    } else {
      alert("Failed to remove movie.");
    }
  } catch (err) {
    console.error("Remove movie error:", err);
    alert("❌ Error removing movie from list.");
  }
};
const btnStyle = {
  background: "#ff4d4d",
  color: "#fff",
  border: "none",
  marginLeft: "10px",
  padding: "5px 8px",
  borderRadius: "4px",
  cursor: "pointer",
};

  return (
    <div className="page">
      <h2>🎥 Watch Later</h2>
      {list.length === 0 ? (
        <p>No saved movies yet.</p>
      ) : (
        <ul>
          <ul>
  {list.map((m) => (
    <li key={m.movie_id}>
      {m.title} ({m.release_year}) — ⭐ {m.imdb_rating}
      <button
        style={btnStyle}
        onClick={() => handleRemove(m.movie_id)}
      >
        ❌ Remove
      </button>
    </li>
  ))}
</ul>

        </ul>
      )}
    </div>
  );
}
