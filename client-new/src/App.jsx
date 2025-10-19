import React, { createContext, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Movies from "./pages/Movies.jsx";
import Recommendations from "./pages/Recommendations.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import "./index.css";

export const UserContext = createContext(null);

function NavBar() {
  return (
    <nav className="navbar">
      <div className="logo">🎬 Movie Finder</div>
      <div>
        <Route path="/" element={<Home />} />
<Route path="/movies" element={<Movies />} />
<Route path="/recommendations" element={<Recommendations />} />
<Route path="/login" element={<Login />} />
<Route path="/signup" element={<Signup />} />
<Route path="/watchlater" element={<WatchLater />} />


      </div>
    </nav>
  );
}

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser }}>
      <Router>
        <NavBar />
        <div className="page">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </div>
      </Router>
    </UserContext.Provider>
  );
}

export default App;
