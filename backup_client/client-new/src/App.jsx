import React, { createContext, useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Movies from "./pages/Movies.jsx";
import Recommendations from "./pages/Recommendations.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import WatchLater from "./pages/WatchLater.jsx";
import NavBar from "./components/NavBar.jsx";
import "./index.css";

export const UserContext = createContext(null);

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  // ✅ Load user from localStorage when app starts
  useEffect(() => {
    const storedUser = localStorage.getItem("movieFinderUser");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  // ✅ Save user to localStorage when they log in
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("movieFinderUser", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("movieFinderUser");
    }
  }, [currentUser]);

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser }}>
      <Router>
        <NavBar />
        <div className="page">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/watchlater" element={<WatchLater />} />
          </Routes>
        </div>
      </Router>
    </UserContext.Provider>
  );
}

export default App;
