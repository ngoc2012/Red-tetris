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
      fn();
      return { end: jest.fn() };
    },
  };
});

// jest.mock("../utils/utils.js", () => ({
//   board_to_block: jest.fn((_, col, row) => [col, row]),
//   board_to_spectrum: jest.fn(() => "mockSpectrum"),
// }));

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

jest.mock("./Grid.jsx", () => ({
  Grid: jest.fn(() => <div data-testid="grid" />),
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

  it("renders the Grid component", () => {
    render(<Board />);
    expect(screen.getByTestId("grid")).toBeInTheDocument();
  });

});
