// src/pages/Login.jsx
import axios from "axios";
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import UserContext from "../context/userContext"; 
import { API_BASE_URL } from "../config";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { setCurrentUser } = useContext(UserContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(`${API_BASE_URL}/api/login`, {
        username,
        password,
      });

      console.log("📡 Login response:", res.data);

      if (res.data && (res.data.user_id || res.data.id_user)) {
        const userData = {
          user_id: res.data.user_id || res.data.id_user,
          username: res.data.username,
          full_name: res.data.full_name,
        };

        localStorage.setItem("movieFinderUser", JSON.stringify(userData));
        console.log("✅ User saved to localStorage:", userData);

        if (setCurrentUser) {
          setCurrentUser(userData);
        }

        console.log("🎯 Current user context set:", userData);
        navigate("/recommendations");
      } else {
        setError("Unexpected login response.");
      }
    } catch (err) {
      console.error("❌ Login failed:", err);
      if (err.response) {
        setError(err.response.data.error || "Invalid credentials");
      } else {
        setError("Cannot reach backend — check URL or server status");
      }
    }
  };

  return (
    <div className="login-page">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username or Email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default Login;
