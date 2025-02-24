import React, { useState, useEffect } from "react";
import { pos$, key$ } from "../index.jsx";
import flyd from "flyd";
import { useGamepads } from "react-gamepads";
import { Square } from "./Square.jsx";
import { tetrominoes } from "../../server/tetrominoes.js";
import socket from "../socket.js";

export const Board = () => {
  const [grid, setGrid] = useState(
    Array.from({ length: 20 * 10 }).map((_, index) => (
      <Square key={index} name='cell empty'></Square>
    ))
  );
  // const [board, setBoard] = useState(Array.from());

  useEffect(() => {
    socket.emit("new_room");

    const subscription = flyd.map((key) => {
      // Key pressed logic here
      switch (key) {
        case "ArrowRight":
          pos$(pos$() + 1);
          break;
        case "ArrowLeft":
          pos$(pos$() - 1);
          break;
        case "ArrowDown":
          pos$(pos$() + 10);
          break;
        case "ArrowUp":
          // rotation
          break;
        default:
          break;
      }
      console.log(key);
    }, key$);

    const subscription1 = flyd.map((pos) => {
      setGrid(
        Array.from({ length: 20 * 10 }).map((_, i) => {
          const row = Math.floor(i / 10);
          const col = i % 10;
          const block_row = Math.floor(pos / 10);
          const block_col = pos % 10;
          const isBlocked = false;
          let isFilled = false;
          // console.log(tetrominoes.J);
          if (
            row >= block_row &&
            row <= block_row + 2 &&
            col >= block_col &&
            col <= block_col + 2
          )
            isFilled = tetrominoes.J[0][row - block_row][col - block_col] == 1;
          return (
            <Square
              key={i}
              name={`cell ${isBlocked ? "blocked" : isFilled ? "filled J" : "empty"}`}
            ></Square>
          );
        })
      );
    }, pos$);

    return () => {
      subscription.end(true);
      subscription1.end(true);
    };
  }, []);

  // Gamepad logic
  const [gamepads, setGamepads] = useState({});
  useGamepads((gamepads) => setGamepads(gamepads));

  useEffect(() => {
    if (gamepads[0] !== undefined) {
      gamepads[0].buttons.forEach((button, index) => {
        if (button.pressed) {
          console.log("Button pressed:", index);
        }
      });
      gamepads[0].axes.forEach((value, index) => {
        if (value !== 0) {
          if (index === 0) {
            if (value === -1) {
              console.log("Left pressed");
            } else if (value === 1) {
              console.log("Right pressed");
            }
          } else if (index === 1) {
            if (value === -1) {
              console.log("Up pressed");
            } else if (value === 1) {
              console.log("Down pressed");
            }
          }
        }
      });
    }
  }, [gamepads[0]]);

  // perhaps use a 2d array to handle line clearing
  // const grid = ;

  return <div className='board'>{grid}</div>;
};
