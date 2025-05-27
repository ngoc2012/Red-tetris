import React, { useState, useEffect } from "react";

export const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/history")
      .then((response) => response.json())
      .then((data) => {
        setHistory(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching history data:", error);
        setLoading(false);
      });
  }
  , []);

  return (
    <div className="history">
      <h2>History</h2>
      {loading ? (
        <p>Loading...</p>
      ) : history.length > 0 ? (
        <div style={{ height: "85vh", overflow: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead style={{
              position: "sticky",
              top: 0,
              backgroundColor: "rgba(255, 255, 255, 0.5)",
              backdropFilter: "blur(6px)",
              color: "#000",
              zIndex: 2, 
            }}>
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
        </div>
      ) : (
        <p>No history available.</p>
      )}
    </div>
  );  
};

const thStyle = {
  border: "1px solid #ccc",
  padding: "8px",
  textAlign: "center",
};

const tdStyle = {
  border: "1px solid #ccc",
  padding: "8px",
};