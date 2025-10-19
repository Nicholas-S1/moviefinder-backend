import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../App.jsx";
import { API_BASE_URL } from "../config.js";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from "recharts";

export default function Home() {
  const { currentUser } = useContext(UserContext);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    fetch(`${API_BASE_URL}/users/${currentUser.user_id}/genres`)
      .then(res => res.json())
      .then(data => {
        const formatted = data.labels.map((g, i) => ({
          genre: g,
          movies: data.data[i],
        }));
        setChartData(formatted);
      })
      .catch(() => setChartData([]));
  }, [currentUser]);

  return (
    <div className="page">
      <h2>Welcome to Movie Finder 🎬</h2>

      {!currentUser && (
        <p className="muted">Log in to see your personalized genre stats!</p>
      )}

      {currentUser && (
        <>
          <h3>Your Genre Chart</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <XAxis dataKey="genre" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="movies" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="muted">No data yet — like or rate some movies to get started!</p>
          )}
        </>
      )}
    </div>
  );
}
