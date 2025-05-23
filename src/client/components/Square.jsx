import React from "react";

export const Square = ({ color, blocked, filled }) => {
  return (
    <div
      className={`cell ${blocked ? "blocked" : filled ? `filled ${color}` : "empty"}`}
      data-testid={`square-${blocked ? "blocked" : filled ? color : "empty"}`}
    ></div>
  );
};
