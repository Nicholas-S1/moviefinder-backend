import React, { useContext, useState } from "react";
import GenreChart from '../components/GenreChart';

export default function Chart() {
    return (
        <div style={pageStyle}>
            <h2 style={{ color: "#fff" }}> Genre Count Chart</h2>
            <p style={{ color: "#ccc" }}>
                Is your favorite genre the highest?
                </p>
                <div style={chartBoxStyle}> 
                    <GenreChart />
                </div>
            </div>
    );
}

const pageStyle = {
  backgroundColor: "#222",
  color: "#fff",
  minHeight: "100vh",
  padding: "40px",
  display: "flex",
  flexDirection: "column",
  gap: "30px",
};

const chartBoxStyle = {
  backgroundColor: "#333",
  padding: "20px",
  borderRadius: "8px",
  width: "90%",
  boxShadow: "0 0 10px rgba(0,0,0,0.3)",
  maxWidth: "800px"
};
