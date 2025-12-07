import React, { useEffect, useState, useContext } from "react"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from "recharts";
import UserContext from "../context/userContext";
import { API_BASE_URL } from "../config.js";

export default function GenreChart() {
    const { currentUser } = useContext(UserContext);
    const [genreData, setGenreData] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!currentUser) return;

        const fetchGenreStats = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/users/${currentUser.user_id}/genre-stats`);
                if (!res.ok) throw new Error("Failed to fetch chart data");
                const data = await res.json();
                setGenreData(data);
            } 
            catch (err) {
                console.error("Chart error:", err);
                setError("Could not create genres chart");
            }
        };

        fetchGenreStats();
    }, [currentUser]);

        if (!currentUser) {
            return <p style={{ color: "#ccc" }}>Please log in to view your chart.</p>;
        }

        if (error) {
            return <p style={{ color: "#e63946" }}>{error}</p>;
        }

        const totalMovies = genreData.reduce((sum, g) => sum + parseInt(g.count), 0);

        return (
            <div style={{ width: "100%", textAlign: "center" }}>
                <h3 style={{ color: "#3a86ff"}}>Total Movies Counted: {totalMovies}</h3>

                {genreData.length === 0 ? (
                    <p style={{ color: "#ccc" }}>You don't have any movies saved to watch later or any rated 7 stars or higher!</p>
                ) : (
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={genreData} margin={{ top: 20, right: 30, left: 10, bottom: 20}}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                            <XAxis dataKey="genre" stroke="#ccc" tick={{ fill: "#ccc" }} />
                            <YAxis stroke="#ccc" tick={{ fill: "#ccc" }} />
                            
                            <Bar dataKey="count" fill="#3a86ff" radius={[6, 6, 0, 0]} />

                            </BarChart>
                        </ResponsiveContainer>
                )}

                </div>    
                );
            }
        