// src/js/api.js
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export async function fetchMovies(query = "") {
  try {
    const url = `${API_BASE_URL}/api/movies?q=${encodeURIComponent(query)}`;
    console.log("Fetching from:", url); // 👈 Add this line for debugging

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);

    const data = await response.json();
    console.log("✅ Fetched movies:", data);
    return data;
  } catch (err) {
    console.error("❌ Error fetching movies:", err);
    return [];
  }
}
