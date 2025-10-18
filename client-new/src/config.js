// src/config.js
const API_BASE_URL =
  import.meta.env.MODE === 'production'
    ? 'https://moviefinder-backend-x1ab.onrender.com' // <-- your Render backend URL
    : 'http://localhost:5000'; // <-- local dev backend

export default API_BASE_URL;
