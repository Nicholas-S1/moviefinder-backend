// src/config.js
const API_BASE_URL =
  import.meta.env.MODE === 'production'
    ? 'https://moviefinder-backend-1.onrender.com/api' // Render backend
    : 'http://localhost:5000/api'; // Local dev

export default API_BASE_URL;
