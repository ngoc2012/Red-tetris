import { useEffect } from "react";
import flyd from "flyd";
import { piece$, keys$, touche$ } from "../streams.js";
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
    const onTouchStart = (event) => { touche$(
      {
        start: {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY
        },
        end: {
          x: touche$().end.x,
          y: touche$().end.y
        }
      }); };
    const onTouchMove = (event) => { touche$(
      {
        start: {
          x: touche$().start.x,
          y: touche$().start.y
        },
        end: {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY
        }
      }); };
    const onTouchEnd = (event) => {
      const deltaX = touche$().end.x - touche$().start.x;
      const deltaY = touche$().end.y - touche$().start.y;
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 5) {
          keys$(keys$().concat(RIGHT));
        } else if (deltaX < -5) {
          keys$(keys$().concat(LEFT));
        }
      } else {
        // Vertical swipe
        if (deltaY > 5) {
          keys$(keys$().concat(DOWN));
        } else if (deltaY < -5) {
          keys$(keys$().concat(ROT));
        }
      }
      touche$({start: {x:0, y:0}, end: {x:0, y:0}});
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      subscription.end(true);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);
};