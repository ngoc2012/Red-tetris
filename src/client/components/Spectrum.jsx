// src/client/components/Spectrum.jsx
import React from 'react';

export const Spectrum = ({ info }) => {
  return (
    <div className='spectrum'>
      <header>{info.playerId}</header>
      <div className='cells'>
        {Array.from({ length: 20 * 10 }).map((_, i) => {
          const row = Math.floor(i / 10);
          const col = i % 10;
          const isBlocked = row >= 20 - info.penalty;
          const isFilled = !isBlocked && row >= 20 - info.spec[col];

          return (
            <div
              key={i}
              className={`spec_cell ${
                isBlocked ? "blocked" : isFilled ? "filled" : "empty"
              }`}
            />
          );
        })}
      </div>
      <footer>{info.score}</footer>
    </div>
  );
};
