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

  const player_leave = (id) => {
    const { [id]: v, ...newSpectrums } = spectrums;
    setSpectrums(newSpectrums);
  };

  const handleSpectrum = ({ id, name, score, spectrum, penalty }) => {
    setSpectrums({
      ...spectrums,
      [id]: { playerId: name, score: score, spec: spectrum, penalty: penalty },
    });
  };

  useEffect(() => {
    socket.emit("spectrums", (response) => {
      if (response != null) setSpectrums(response);
    });

    return () => {};
  }, []);

  useEffect(() => {
    socket.on("spectrum", handleSpectrum);
    socket.on("player_leave", player_leave);

    return () => {
      socket.off("spectrum", handleSpectrum);
      socket.off("player_leave", player_leave);
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
