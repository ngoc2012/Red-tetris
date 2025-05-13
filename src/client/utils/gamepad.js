import { DOWN, RIGHT, LEFT, ROT, FALL }
  from "../../common/constants.js";
import { keys$ } from "../index.jsx";

const SERIELIMIT_MS = 20;
const GAMEPADLOCK_MS = 10;

let moveCount = 0;
let serieState = false;
let buttonPressed = -1;
let last_pressed = -1;

export const pollGamepads = (gamepadRef, now, lastGamepadInputTimeRef) => {
  const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
  const gp = gamepads[0];
  if (!gp) return;

  gp.buttons.forEach((button, index) => {
    if (button.pressed) {
      if (index === 1 || index === 2) {
        if (buttonPressed !== index) {
          keys$(keys$().concat(ROT));
          buttonPressed = index;
        }
      }
      else if (index === 0 || index === 3) {
        if (buttonPressed !== index) {
          keys$(keys$().concat(FALL));
          buttonPressed = index;
        }
      }
    }
  });

  if (buttonPressed !== -1 && gp.buttons[buttonPressed].value === 0)
    buttonPressed = -1;

  let pressed = -1;
  gp.axes.forEach((value, index) => {
    if (value !== 0) {
      if (index === 0) {
        if (value === -1) pressed = LEFT;
        else if (value === 1) pressed = RIGHT;
      } else if (index === 1) {
        if (value === 1) pressed = DOWN;
      }
    }
  });
  
  if (pressed !== -1) {
    if (!serieState && pressed !== last_pressed)
      keys$(keys$().concat(pressed));
    if (last_pressed === pressed) {
      moveCount++;
      if (moveCount > SERIELIMIT_MS) {
        serieState = true;
        moveCount = 0;
      }
    }
    if (serieState && now - lastGamepadInputTimeRef.current > GAMEPADLOCK_MS) {
      lastGamepadInputTimeRef.current = now;
      keys$(keys$().concat(pressed));
    }
  }

  if (pressed === -1 || last_pressed !== pressed) {
    serieState = false;
    moveCount = 0;
  }
  last_pressed = pressed;
};