import { useEffect } from "react";
import flyd from "flyd";
import { piece$, keys$ } from "../streams.js";
import { DOWN, LEFT, RIGHT, ROT, FALL } from "../../common/constants.js";


export const useKeyboard = () => {
  useEffect(() => {
    const key$ = flyd.stream();

    const subscription = flyd.map((key) => {
      if (!piece$() || !key)
        return;
      switch (key) {
        case "ArrowRight":
          keys$(keys$().concat(RIGHT));
          break;
        case "ArrowLeft":
          keys$(keys$().concat(LEFT));
          break;
        case "ArrowDown":
          keys$(keys$().concat(DOWN));
          break;
        case "ArrowUp":
          keys$(keys$().concat(ROT));
          break;
        case " ":
          keys$(keys$().concat(FALL));
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