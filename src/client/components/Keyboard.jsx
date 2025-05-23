import { useEffect } from "react";
import flyd from "flyd";
import { piece$, keys$ } from "../streams.js";
import { DOWN, LEFT, RIGHT, ROT, FALL } from "../../common/constants.js";


export const useKeyboard = () => {
  // console.log("useKeyboard");

  useEffect(() => {
    const key$ = flyd.stream();

    const subscription = flyd.map((key) => {
      if (!piece$() || !key) {
        return;
      }
      switch (key) {
        case "ArrowRight":
          // move_right();
          keys$(keys$().concat(RIGHT));
          break;
        case "ArrowLeft":
          // move_left();
          keys$(keys$().concat(LEFT));
          break;
        case "ArrowDown":
          keys$(keys$().concat(DOWN));
          break;
        case "ArrowUp":
          keys$(keys$().concat(ROT));
          // rotate_piece();
          break;
        case " ":
          keys$(keys$().concat(FALL));
          // move_down_max();
          break;
        default:
          break;
      }
      key$("");
    }, key$);

    const onKeyDown = (event) => { key$(event.key); };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      subscription.end(true);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);
};