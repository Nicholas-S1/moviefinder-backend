import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import UserContext from "../context/userContext";

console.log("✅ NavBar loaded");

export default function NavBar() {
  const { currentUser, setCurrentUser } = useContext(UserContext);
  const navigate = useNavigate();

  // Logout handler clears state and storage
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("movieFinderUser");
    navigate("/login");
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 20px",
        backgroundColor: "#222",
        color: "#fff",
      }}
    >
      {/* Left side navigation links */}
      <div style={{ display: "flex", gap: "16px" }}>
        <Link to="/" style={linkStyle}>Home</Link>
        <Link to="/movies" style={linkStyle}>Movies</Link>
        <Link to="/watchlater" style={linkStyle}>Watch Later</Link>
        <Link to="/recommendations" style={linkStyle}>Recommendations</Link>
        <Link to="/chart" style={linkStyle}>Chart</Link>
      </div>

      {/* Right side — user / auth controls */}
      <div style={{ display: "flex", gap: "12px" }}>
        {currentUser ? (
          <>
            <Link to="/account" style={linkStyle}>Account</Link>
            <span style={{ color: "#aaa" }}>Welcome, {currentUser.username}</span>
            <button
              onClick={handleLogout}
              style={{
                background: "#e63946",
                border: "none",
                color: "#fff",
                padding: "6px 10px",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={linkStyle}>Login</Link>
            <Link to="/signup" style={linkStyle}>Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
}

const linkStyle = {
  color: "#fff",
  textDecoration: "none",
  fontWeight: "500",
};
