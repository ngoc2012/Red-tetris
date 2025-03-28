import React, { useEffect, useState } from "react";
import socket from "../socket";

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

export const Spectrums = () => {
  const [spectrums, setSpectrums] = useState({});
  // const spectrums = [
  //   {playerId: "player 1", score: 12,    spec: Array.from({ length: 10 }, () => Math.floor(Math.random() * 20) + 1), penalty: Math.floor(Math.random() * 15) + 1},
  //   {playerId: "player 2", score: 24524, spec: Array.from({ length: 10 }, () => Math.floor(Math.random() * 20) + 1), penalty: Math.floor(Math.random() * 15) + 1},
  //   // {playerId: "player 3", score: 45365, spec: Array.from({ length: 10 }, () => Math.floor(Math.random() * 20) + 1), penalty: Math.floor(Math.random() * 15) + 1}
  // ];
  // // console.log(spectrums);

  const handleSpectrum = ({ id, name, score, spectrum, penalty }) => {
    setSpectrums({
      ...spectrums,
      [id]: { playerId: name, score: score, spec: spectrum, penalty: penalty },
    });
  };

  useEffect(() => {
    socket.on("spectrum", handleSpectrum);

    return () => {
      socket.off("spectrum", handleSpectrum);
    };
  }, [spectrums]);

  return (
    <div className='spectrum_list'>
      {Object.keys(spectrums).map((s) => (
        <Spectrum key={s} info={spectrums[s]} />
      ))}
    </div>
  );
};
