import { useState, useEffect } from "react";
import { useGamepads } from "react-gamepads";
import { piece$, keys$ } from "../index.jsx";
import { DOWN, LEFT, RIGHT, ROT, FALL } from "../../common/constants.js";

export const useGamepad = () => {
  // Gamepad logic
  const [gamepads, setGamepads] = useState({});
  useGamepads((gamepads) => setGamepads(gamepads));

  useEffect(() => {
    if (!piece$()) return;
    if (gamepads[0] === undefined) return;
    gamepads[0].buttons.forEach((button, index) => {
      if (button.pressed) {
        if (index == 1 || index == 2) keys$(keys$().concat(ROT));
        else if (index == 0 || index == 3) keys$(keys$().concat(FALL));
      }
    });
    gamepads[0].axes.forEach((value, index) => {
      if (value !== 0) {
        if (index === 0) {
          if (value === -1)
            keys$(keys$().concat(LEFT));
          else if (value === 1)
            keys$(keys$().concat(RIGHT));
        } else if (index === 1) {
          if (value === -1)
            keys$(keys$().concat(ROT));
          else if (value === 1)
            keys$(keys$().concat(DOWN));
        }
      }
    });
  }, [gamepads[0]]);
};

export const pollGamepadInput = () => {
  const gamepads = navigator.getGamepads();
  const gp = gamepads[0];
  if (!gp || !piece$()) return -1;

  // Check buttons
  for (let i = 0; i < gp.buttons.length; i++) {
    if (gp.buttons[i].pressed) {
      if (i === 1 || i === 2) return ROT;
      if (i === 0 || i === 3) return FALL;
    }
  }

  // Check axes
  for (let i = 0; i < gp.axes.length; i++) {
    const value = gp.axes[i];
    if (value !== 0) {
      if (i === 0) {
        if (value === -1) return LEFT;
        if (value === 1) return RIGHT;
      } else if (i === 1) {
        if (value === -1) return ROT;
        if (value === 1) return DOWN;
      }
    }
  }

  return -1;
};