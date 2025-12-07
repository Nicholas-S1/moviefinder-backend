// api.js
import { API_BASE_URL } from "../config";


export async function fetchMovies() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/movies`);
    if (!response.ok) throw new Error("Failed to fetch movies");
    return await response.json();
  } catch (err) {
    console.error("Error fetching movies:", err);
    return [];
  }
}
