import React from "react";
import { render, screen } from "@testing-library/react";
import { useSelector } from "react-redux";
import { Board } from "./Board.jsx";
import * as utils from "../utils/utils.js";
import { BUFFER, LENGTH, WIDTH } from "../../common/constants.js";
import { Gamemode } from "../../common/enums.js";


import * as streams from "../streams.js";

beforeEach(() => {
  // Reset stream values
  streams.pos$(3);
  streams.rot$(0);
  streams.piece$("");
});

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

// Constants
const BOARD_SIZE = WIDTH * (LENGTH + BUFFER);

jest.mock("flyd", () => ({
  stream: jest.fn(() => {
    const f = jest.fn();
    f.end = jest.fn();
    return f;
  }),
  combine: jest.fn((fn) => {
    return { end: jest.fn() };
  }),
}));

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

    utils.board_to_block.mockImplementation(() => []);
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

  // it("calls board_to_spectrum and emits board_update on board change", () => {
  //   render(<Board />);
  //   expect(utils.board_to_spectrum).toHaveBeenCalled();
  //   expect(socket.emit).toHaveBeenCalledWith("board_update", []);
  // });

  // it("renders piece when present", () => {
  //   render(<Board />);
  //   // Can't assert visual but we know the mock piece returns "I"
  //   expect(indexModule.piece$).toHaveBeenCalled();
  // });
});
