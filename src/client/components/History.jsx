import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";

export const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/history")
      .then((response) => response.json())
      .then((data) => {
        console.log("History data:", data);
        setHistory(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching history data:", error);
      });
  }
  , []);

  return (
    <div>
      <h2>History</h2>
      {loading ? <p>Loading...</p> : 
      (history.length > 0 ? 
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th style={thStyle}>#</th>
              <th style={thStyle}>Time</th>
              <th style={thStyle}>Room</th>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Score</th>
              <th style={thStyle}>Result</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, index) => (
              <tr key={index}>
                <td style={tdStyle}>{index + 1}</td>
                <td style={tdStyle}>{item.time}</td>
                <td style={tdStyle}>{item.room}</td>
                <td style={tdStyle}>{item.name}</td>
                <td style={tdStyle}>{item.score}</td>
                <td style={tdStyle}>{item.result}</td>
              </tr>
            ))}
          </tbody>
        </table>
      : (<p>No history available.</p>)
    )
      }
    </div>
  );
};

const thStyle = {
  border: "1px solid #ccc",
  padding: "8px",
  // backgroundColor: "#f2f2f2",
  textAlign: "center",
};

const tdStyle = {
  border: "1px solid #ccc",
  padding: "8px",
};