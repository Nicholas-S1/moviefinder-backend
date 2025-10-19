// =======================
// 🌐 Frontend API Config
// =======================

// When running locally (npm run dev), use localhost.
// When deployed, automatically use the Render backend.

const PROD_API = "https://moviefinder-backend-n41a.onrender.com/api";
const LOCAL_API = "http://localhost:5000/api";

export const API_BASE_URL =
  window.location.hostname === "localhost" ? LOCAL_API : PROD_API;
