// src/client/components/Spectrums.jsx
import React, { useEffect, useState } from "react";
import socket from "../socket";
import { Spectrum } from "./Spectrum";

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
