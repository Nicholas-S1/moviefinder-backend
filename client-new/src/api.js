// src/api.js
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export async function fetchMovies(query = "") {
  try {
    const url = `${API_BASE_URL}/movies?q=${encodeURIComponent(query)}`;
    console.log("🎬 Fetching from:", url);

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    console.log("✅ Got movies:", data);
    return data;
  } catch (err) {
    console.error("❌ Error fetching movies:", err);
    return [];
  }
}
