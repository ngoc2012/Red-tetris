import React, { useState, useEffect } from "react";
import { pos$, rot$, key$, piece$ } from "../index.jsx";
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
          if (pos$() % 10 <= 8) {
            pos$(pos$() + 1);
          }
          break;
        case "ArrowLeft":
          if (pos$() % 10 > 0) {
            pos$(pos$() - 1);
          }
          break;
        case "ArrowDown":
          pos$(pos$() + 10);
          break;
        case "ArrowUp":
          // rotation
          rot$((rot$() + 1) % tetrominoes[piece$()].length);
          break;
        default:
          break;
      }
      console.log(key);
    }, key$);

    const subscription1 = flyd.combine(
      (pos$, rot$) => {
        setGrid(
          Array.from({ length: 20 * 10 }).map((_, i) => {
            const row = Math.floor(i / 10);
            const col = i % 10;
            const block_row = Math.floor(pos$() / 10);
            const block_col = pos$() % 10;
            const isBlocked = false;
            let isFilled = false;
            if (
              row >= block_row &&
              row <= block_row + tetrominoes[piece$()][rot$()].length - 1 &&
              col >= block_col &&
              col <= block_col + tetrominoes[piece$()][rot$()][0].length - 1
            )
              isFilled =
                tetrominoes[piece$()][rot$()][row - block_row][col - block_col] == 1;
            return (
              <Square
                key={i}
                color={piece$()}
                filled={isFilled}
                blocked={isBlocked}
              ></Square>
            );
          })
        );
      },
      [pos$, rot$]
    );

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
