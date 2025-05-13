import { useState, useEffect } from "react";
// import { useGamepads } from "react-gamepads";
import { gamepad$, piece$, keys$ } from "../index.jsx";
import { DOWN, LEFT, RIGHT, ROT, FALL } from "../../common/constants.js";

export const useGamepad = () => {
  function gamepadHandler(event, connected) {
    const gamepad = event.gamepad;
    console.log(gamepad.axes, gamepad.buttons);
    // Note:
    // gamepad === navigator.getGamepads()[gamepad.index]
  
    // if (connected) {
    //   gamepads[gamepad.index] = gamepad;
    // } else {
    //   delete gamepads[gamepad.index];
    // }
  }

  useEffect(() => {
    console.log("Gamepad connected");
    window.addEventListener(
      "gamepadconnected",
      (e) => {
        gamepadHandler(e, true);
      },
      false,
    );
    window.addEventListener(
      "gamepaddisconnected",
      (e) => {
        gamepadHandler(e, false);
      },
      false,
    );
    
  }, []);

  // Gamepad logic
  // const [gamepads, setGamepads] = useState({});
  // useGamepads((gamepads) => setGamepads(gamepads));

  // useEffect(() => {
  //   if (!piece$()) return;
  //   if (gamepads[0] === undefined) return;
  //   gamepads[0].buttons.forEach((button, index) => {
  //     if (button.pressed) {
  //       if (index == 1 || index == 2) keys$(keys$().concat(ROT));
  //       else if (index == 0 || index == 3) keys$(keys$().concat(FALL));
  //     }
  //   });
  //   console.log(gamepads[0].axes);
  //   if (gamepads[0].axes[0] === 0 && gamepads[0].axes[1] === 0) gamepad$(0);
  //   gamepads[0].axes.forEach((value, index) => {
  //     if (value !== 0) {
  //       if (index === 0) {
  //         if (value === -1) 
  //           gamepad$(LEFT);
  //         else if (value === 1)
  //           gamepad$(RIGHT);
  //       } else if (index === 1) {
  //         if (value === -1)
  //           keys$(keys$().concat(ROT));
  //         else if (value === 1)
  //           gamepad$(DOWN);
  //       }
  //     }
  //   });
  // }, [gamepads[0]]);
};
