// src/client/components/Square.jsx
import React from 'react';


export const Square = ({ color, blocked, filled }) => {
  return (
    <div
      className={`cell ${blocked ? "blocked" : filled ? `filled ${color}` : "empty"}`}
    ></div>
  );
};
