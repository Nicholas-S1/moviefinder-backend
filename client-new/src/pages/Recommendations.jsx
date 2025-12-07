import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";

function Recommendations() {
  //  Get the logged-in user from localStorage
  let parsedUser = null;
  const stored =
    localStorage.getItem("movieFinderUser") ||
    localStorage.getItem("currentUser");

  if (stored) {
    try {
      parsedUser = JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse stored user:", e);
    }
  }

  const userId = parsedUser?.user_id;

  // State
  const [recommendations, setRecommendations] = useState([]);
  const [type, setType] = useState("genre");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //  Fetch recommendations whenever userId or type changes
  useEffect(() => {
    if (!userId) {
      setError("Please log in to see recommendations.");
      setLoading(false);
      setRecommendations([]);
      return;
    }

    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        console.log(
          ` Fetching recommendations for user ${userId}, type: ${type}`
        );

        const res = await fetch(
          `${API_BASE_URL}/api/recommendations/${userId}?type=${type}`
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch recommendations");
        }

        if (!Array.isArray(data)) {
          console.warn("Recommendations response was not an array:", data);
          setRecommendations([]);
        } else {
          setRecommendations(data);
        }

        setError(null);
      } catch (err) {
        console.error("Recommendation fetch error:", err);
        setError("Failed to load recommendations");
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userId, type]);

  //  Render
  return (
    <div className="text-white p-6">
      <h2 className="text-2xl font-bold mb-4">Recommended Movies</h2>

      <div className="mb-4">
        <label className="mr-2">Recommendation Type:</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="bg-gray-800 p-2 rounded text-white"
        >
          <option value="genre">🎬 Based on Favorite Genres</option>
          <option value="director">
            🎥 Based on Favorite Favorites (Director tab)
          </option>
          <option value="top">🏆 Top Rated Movies</option>
        </select>
      </div>

      {loading ? (
        <p>Loading recommendations...</p>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : recommendations.length === 0 ? (
        <p>No recommendations yet. Try rating a few movies!</p>
      ) : (
        <ul className="space-y-2">
          {recommendations.map((movie) => (
            <li
              key={movie.movie_id}
              className="bg-gray-900 p-3 rounded shadow-md hover:bg-gray-800"
            >
              <span className="font-semibold">{movie.title}</span>{" "}
              {movie.release_year && `(${movie.release_year})`} — ⭐{" "}
              {movie.imdb_rating ?? "N/A"}
              {movie.genres && (
                <p className="text-gray-400 text-sm">{movie.genres}</p>
              )}
              {movie.director && (
                <p className="text-gray-400 text-sm">
                  🎥 Directed by {movie.director}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Recommendations;
