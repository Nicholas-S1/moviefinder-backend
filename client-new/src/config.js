// =======================
// 🌐 Frontend API Config
// =======================

// When running locally (npm run dev), use localhost.
// When deployed, automatically use the Render backend.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:10000";
export default API_BASE_URL;
