import React, { useContext, useState } from "react";
import UserContext from "../context/userContext";
import { API_BASE_URL } from "../config.js";

export default function Account() {
  const { currentUser, setCurrentUser } = useContext(UserContext);

  const [fullName, setFullName] = useState(currentUser?.full_name || "");
  const [username, setUsername] = useState(currentUser?.username || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  if (!currentUser) {
    return (
      <div style={pageStyle}>
        <h2>Account Settings</h2>
        <p>Please log in to manage your account.</p>
      </div>
    );
  }

  // Update name / username
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${currentUser.user_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName, username }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Profile updated successfully!");
        setCurrentUser({ ...currentUser, full_name: fullName, username });
        localStorage.setItem(
          "movieFinderUser",
          JSON.stringify({ ...currentUser, full_name: fullName, username })
        );
      } else {
        setMessage(data.error || "❌ Failed to update profile");
      }
    } catch {
      setMessage("❌ Server error updating profile");
    }
  };

  //  Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${currentUser.user_id}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      setMessage(res.ok ? "✅ Password changed successfully!" : data.error);
    } catch {
      setMessage("❌ Server error changing password");
    }
  };

  //  Delete account
  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${currentUser.user_id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.removeItem("movieFinderUser");
        setCurrentUser(null);
        setMessage("✅ Account deleted successfully.");
      } else {
        setMessage(data.error || "❌ Failed to delete account");
      }
    } catch {
      setMessage("❌ Server error deleting account");
    }
  };

  return (
    <div style={pageStyle}>
      <h2 style={{ color: "#fff" }}>Account Settings</h2>
      {message && <p style={{ color: "#3a86ff" }}>{message}</p>}

      <section style={sectionStyle}>
        <h3>Update Profile</h3>
        <form onSubmit={handleUpdateProfile} style={formStyle}>
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={inputStyle}
          />
          <button type="submit" style={buttonStyle}>Save Changes</button>
        </form>
      </section>

      <section style={sectionStyle}>
        <h3>Change Password</h3>
        <form onSubmit={handleChangePassword} style={formStyle}>
          <input
            type="password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={inputStyle}
          />
          <button type="submit" style={buttonStyle}>Change Password</button>
        </form>
      </section>

      <section style={sectionStyle}>
        <h3 style={{ color: "#ff4d4d" }}>Danger Zone</h3>
        <button onClick={handleDeleteAccount} style={dangerButtonStyle}>
          Delete Account
        </button>
      </section>
    </div>
  );
}

// Inline dark theme styles
const pageStyle = {
  backgroundColor: "#222",
  color: "#fff",
  minHeight: "100vh",
  padding: "40px",
  display: "flex",
  flexDirection: "column",
  gap: "30px",
};

const sectionStyle = {
  backgroundColor: "#333",
  padding: "20px",
  borderRadius: "8px",
  boxShadow: "0 0 10px rgba(0,0,0,0.3)",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  marginTop: "10px",
};

const inputStyle = {
  padding: "8px",
  borderRadius: "4px",
  border: "1px solid #555",
  backgroundColor: "#111",
  color: "#fff",
};

const buttonStyle = {
  backgroundColor: "#3a86ff",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  padding: "8px 12px",
  cursor: "pointer",
};

const dangerButtonStyle = {
  ...buttonStyle,
  backgroundColor: "#e63946",
};
