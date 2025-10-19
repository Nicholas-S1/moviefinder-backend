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

  return (
    <div className="page">
      <h2>🎥 Watch Later</h2>
      {list.length === 0 ? (
        <p>No saved movies yet.</p>
      ) : (
        <ul>
          {list.map((m) => (
            <li key={m.movie_id}>
              {m.title} ({m.release_year}) — ⭐ {m.imdb_rating}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
