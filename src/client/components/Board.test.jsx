import React from "react";
import { render, screen } from "@testing-library/react";
import { Board } from "./Board.jsx";

// Mocks
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
}));

jest.mock("../streams.js", () => ({
  pos$: jest.fn(() => 0),
  rot$: jest.fn(() => 0),
  piece$: jest.fn(() => "T"),
}));

// mock flyd.combine
jest.mock("flyd", () => {
  const originalFlyd = jest.requireActual("flyd");
  return {
    ...originalFlyd,
    combine: (fn, streams) => {
      // call immediately to simulate reactive behavior
      fn();
      return { end: jest.fn() }; // mock return to allow .end(true)
    },
  };
});

jest.mock("../utils/utils.js", () => ({
  board_to_block: jest.fn((_, col, row) => [col, row]),
  board_to_spectrum: jest.fn(() => "mockSpectrum"),
}));

jest.mock("../socket.js", () => ({
  emit: jest.fn(),
}));

jest.mock("../../common/tetrominoes.js", () => ({
  tetrominoes: {
    T: [
      [  // Rotation 0
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0],
      ],
    ],
  },
}));

jest.mock("../../common/enums.js", () => ({
  Gamemode: {
    NORMAL: "NORMAL",
    INVIS: "INVIS",
  },
}));

jest.mock("./Square.jsx", () => ({
  Square: ({ color, filled, blocked }) => (
    <div
      data-testid="square"
      data-color={color}
      data-filled={filled}
      data-blocked={blocked}
    />
  ),
}));

describe("<Board />", () => {
  const { useSelector } = require("react-redux");
  const socket = require("../socket.js");

  beforeEach(() => {
    jest.clearAllMocks();
    useSelector.mockImplementation((cb) =>
      cb({
        game_state: {
          board: Array(10 * 20).fill(""),
          gamemode: "normal",
        },
      })
    );
  });

  it("renders a full grid of squares", () => {
    render(<Board />);
    const squares = screen.getAllByTestId("square");
    // WIDTH = 10, LENGTH + BUFFER = 22
    expect(squares.length).toBe(220); // Includes buffer
  });

  it("emits board_update with spectrum when board changes", () => {
    render(<Board />);
    expect(socket.emit).toHaveBeenCalledWith("board_update", "mockSpectrum");
  });

  it("does not show filled squares when gamemode is INVIS", () => {
    useSelector.mockImplementation((cb) =>
      cb({
        game_state: {
          board: Array(10 * 22).fill("Z"),
          gamemode: "INVIS",
        },
      })
    );
    render(<Board />);
    const filledSquares = screen.getAllByTestId("square");
    expect(filledSquares.every((s) => s.dataset.filled === "false")).toBe(true);
  });
});
