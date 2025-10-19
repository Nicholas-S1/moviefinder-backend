import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../App.jsx";

export default function Login() {
  const { setCurrentUser } = useContext(UserContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: email, // ✅ matches backend field name
          password,
        }),
      });

      const data = await res.json();
      if (res.ok && data.user_id) {
        setCurrentUser(data);
        navigate("/movies");
      } else {
        setMsg(data.error || "Invalid login credentials");
      }
    } catch (err) {
      console.error(err);
      setMsg("Server error");
    }
  };

  return (
    <div className="page">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
      {msg && <p className="muted">{msg}</p>}
    </div>
  );
}
