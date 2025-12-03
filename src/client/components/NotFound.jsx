// src/client/components/NotFound.jsx
import React from "react";
import { Link } from "react-router-dom";

export const NotFound = () => {
  return (
    <div>
      <h2>Page Not Found</h2>
      <p>
        The page you're looking for doesn't exist. Go back to the{" "}
        <Link to='/'>home page</Link>.
      </p>
    </div>
  );
};
