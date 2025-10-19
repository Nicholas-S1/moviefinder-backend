import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../App.jsx";

export default function NavBar() {
  const { currentUser, setCurrentUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    setCurrentUser(null);
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
      {/* Left side */}
      <div style={{ display: "flex", gap: "12px" }}>
        <Link to="/" style={linkStyle}>
          Home
        </Link>
        <Link to="/movies" style={linkStyle}>
          Movies
          <Link to="/watchlater" style={linkStyle}>
  Watch Later
</Link>

        </Link>
        <Link to="/recommendations" style={linkStyle}>
          Recommendations
        </Link>
      </div>

      {/* Right side */}
      <div style={{ display: "flex", gap: "12px" }}>
        {currentUser ? (
          <>
            <span style={{ color: "#aaa" }}>
              Welcome, {currentUser.username}
            </span>
            <button
              onClick={handleLogout}
              style={{
                background: "#e63946",
                border: "none",
                color: "#fff",
                padding: "6px 10px",
                cursor: "pointer",
                borderRadius: "4px",
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={linkStyle}>
              Login
            </Link>
            <Link to="/signup" style={linkStyle}>
              Signup
            </Link>
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
