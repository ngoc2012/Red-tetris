import React, { useState, useEffect } from "react";
import { useGamepads } from "react-gamepads";


export const useGamepad = () => {
  // Gamepad logic
  const [gamepads, setGamepads] = useState({});
  useGamepads((gamepads) => setGamepads(gamepads));

  useEffect(() => {
    if (gamepads[0] !== undefined) {
      gamepads[0].buttons.forEach((button, index) => {
        if (button.pressed) {
          if (index == 1 || index == 2) rotate_piece(board);
          if (index == 0 || index == 3) move_down_max(board, dispatch);
          // console.log("Button pressed:", index);
        }
      });
      gamepads[0].axes.forEach((value, index) => {
        if (value !== 0) {
          if (index === 0) {
            if (value === -1) {
              move_left(board);
              // console.log("Left pressed");
            } else if (value === 1) {
              move_right(board);
              // console.log("Right pressed");
            }
          } else if (index === 1) {
            if (value === -1) {
              rotate_piece(board);
              // console.log("Up pressed");
            } else if (value === 1) {
              move_down(board, dispatch);
              // console.log("Down pressed");
            }
          }
        }
      });
    }
  }, [gamepads[0]]);
};