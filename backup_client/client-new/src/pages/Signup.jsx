import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../App.jsx"; // ✅ to access global user
import { API_BASE_URL } from "../config.js";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const { setCurrentUser } = useContext(UserContext); // ✅ add this
  const navigate = useNavigate(); // ✅ add this

  const handleSignup = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: name,
          username: email,
          password: password,
        }),
      });

      const data = await res.json();

      if (res.ok && data.user_id) {
        // ✅ Auto-login
        setCurrentUser(data);
        navigate("/movies");
      } else {
        setMsg(data.error || "Signup failed.");
      }
    } catch (err) {
      console.error(err);
      setMsg("Server error.");
    }
  };

  return (
    <div className="page">
      <h2>Sign Up</h2>
      <form onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
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
        <button type="submit">Sign Up</button>
      </form>
      {msg && <p className="muted">{msg}</p>}
    </div>
  );
}
