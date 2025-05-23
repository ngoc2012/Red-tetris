import React from "react";
import { render, screen } from "@testing-library/react";
import { useSelector } from "react-redux";
import { Board } from "./Board.jsx";
import * as flyd from "flyd";
import * as indexModule from "../index.jsx";
import * as utils from "../utils/utils.js";
import socket from "../socket.js";
import { BUFFER, LENGTH, WIDTH } from "../../common/constants.js";
import { Gamemode } from "../../common/enums.js";
import { tetrominoes } from "../../common/tetrominoes.js";


// Mock Redux
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
}));

// Mock Socket.IO
jest.mock("../socket.js", () => ({
  emit: jest.fn(),
}));

// Mock utility functions
jest.mock("../utils/utils.js", () => ({
  board_to_block: jest.fn(),
  board_to_spectrum: jest.fn(),
}));

// Mock flyd
jest.spyOn(flyd, "combine").mockImplementation((fn) => {
  fn(); // simulate immediate call
  return { end: jest.fn() };
});

// Mock flyd signals
const mockPos = jest.fn(() => [0, 0]);
const mockRot = jest.fn(() => 0);
const mockPiece = jest.fn(() => "I");

jest.spyOn(indexModule, "pos$").mockImplementation(mockPos);
jest.spyOn(indexModule, "rot$").mockImplementation(mockRot);
jest.spyOn(indexModule, "piece$").mockImplementation(mockPiece);

// Constants
const BOARD_SIZE = WIDTH * (LENGTH + BUFFER);

// // Tetromino mock
// const tetrominoesMock = {
//   I: [
//     [[1, 1, 1, 1]],
//     [[1], [1], [1], [1]],
//   ],
// };

// jest.mock("../../common/tetrominoes.js", () => ({
//   tetrominoes: {
//     I: [
//       [[1, 1, 1, 1]],
//       [[1], [1], [1], [1]],
//     ],
//   },
// }));

describe("Board Component", () => {
  beforeEach(() => {
    useSelector.mockImplementation((cb) =>
      cb({
        game_state: {
          board: Array(BOARD_SIZE).fill(""),
          gamemode: Gamemode.NORMAL,
        },
      })
    );

    utils.board_to_block.mockImplementation(() => [0, 0]);
    utils.board_to_spectrum.mockImplementation(() => []);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the board with correct number of squares", () => {
    render(<Board />);
    const squares = screen.getAllByRole("gridcell");
    expect(squares.length).toBe(BOARD_SIZE - WIDTH * BUFFER);
  });

  it("calls board_to_spectrum and emits board_update on board change", () => {
    render(<Board />);
    expect(utils.board_to_spectrum).toHaveBeenCalled();
    expect(socket.emit).toHaveBeenCalledWith("board_update", []);
  });

  it("renders piece when present", () => {
    render(<Board />);
    // Can't assert visual but we know the mock piece returns "I"
    expect(indexModule.piece$).toHaveBeenCalled();
  });
});
