import React from "react";
import { render } from "@testing-library/react";
import { useKeyboard } from "./Keyboard.jsx";
import { RIGHT, LEFT, DOWN, ROT, FALL } from "../../common/constants";

// Mock streams
jest.mock("../streams.js", () => {
  const flyd = require("flyd");
  return {
    piece$: flyd.stream("I"), // always has a piece
    keys$: (() => {
      const s = flyd.stream([]);
      s.set = (val) => s(val);
      return s;
    })(),
  };
});

describe("useKeyboard hook", () => {
  const keys = require("../streams.js").keys$;

  const TestComponent = () => {
    useKeyboard();
    return null;
  };

  const fireKey = (key) => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key }));
  };

  beforeEach(() => {
    keys.set([]); // Reset before each test
  });

  it("adds RIGHT when ArrowRight is pressed", () => {
    render(<TestComponent />);
    fireKey("ArrowRight");
    expect(keys()).toContain(RIGHT);
  });

  it("adds LEFT when ArrowLeft is pressed", () => {
    render(<TestComponent />);
    fireKey("ArrowLeft");
    expect(keys()).toContain(LEFT);
  });

  it("adds DOWN when ArrowDown is pressed", () => {
    render(<TestComponent />);
    fireKey("ArrowDown");
    expect(keys()).toContain(DOWN);
  });

  it("adds ROT when ArrowUp is pressed", () => {
    render(<TestComponent />);
    fireKey("ArrowUp");
    expect(keys()).toContain(ROT);
  });

  it("adds FALL when space is pressed", () => {
    render(<TestComponent />);
    fireKey(" ");
    expect(keys()).toContain(FALL);
  });

  it("does not update keys$ when no piece is present", () => {
    const { piece$ } = require("../streams.js");
    piece$(null);
    render(<TestComponent />);
    fireKey("ArrowRight");
    expect(keys()).not.toContain(RIGHT);
  });
});
