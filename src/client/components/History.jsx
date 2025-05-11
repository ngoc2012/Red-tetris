import React, { useEffect } from "react";
// import { Link } from "react-router-dom";

export const History = () => {
  const [history, setHistory] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    // Fetch history data from the server
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
      (history.length > 0 ? (history.map((item, index) => (
        <div key={index}>
          <p>
            Room: {item.room}, Name: {item.name}, Score: {item.score}
          </p>
        </div>
      ))) : (
        <p>No history available.</p>
      ))
      }
    </div>
  );
};
