import React from "react";
import { render, screen } from "@testing-library/react";
import { Grid } from "./Grid";
import { WIDTH, LENGTH, BUFFER } from "../../common/constants.js";
import { Gamemode } from "../../common/enums.js";

// Mock Square to track props
jest.mock("./Square.jsx", () => ({
  Square: jest.fn(({ color, filled, blocked }) => (
    <div data-testid="square" data-color={color} data-filled={filled} data-blocked={blocked}></div>
  )),
}));

describe("Grid component", () => {
  const board = Array(WIDTH * (LENGTH + BUFFER)).fill("");
  const pos = WIDTH / 2 + 2 * WIDTH;
  const rot = 0;
  const piece = "I";
  const tetrominoes = {
    I: [
      [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
    ],
  };

  const board_to_block = (pos, col, row) => [col - pos.x, row - pos.y];

  it("renders the correct number of Square components", () => {
    render(
      <Grid
        board={board}
        gamemode={Gamemode.NORMAL}
        piece={piece}
        pos={pos}
        rot={rot}
        tetrominoes={tetrominoes}
        board_to_block={board_to_block}
        Gamemode={Gamemode}
      />
    );

    const squares = screen.getAllByTestId("square");
    expect(squares).toHaveLength(WIDTH * LENGTH); // excludes BUFFER rows
  });

  it("renders piece blocks with correct props", () => {
    render(
      <Grid
        board={board}
        gamemode={Gamemode.NORMAL}
        piece={piece}
        pos={pos}
        rot={rot}
        tetrominoes={tetrominoes}
        board_to_block={board_to_block}
        Gamemode={Gamemode}
      />
    );

    const pieceSquares = screen
      .getAllByTestId("square")
      .filter((el) => el.dataset.filled === "true" && el.dataset.blocked === "false");

    // The I tetromino should render 4 filled blocks
    expect(pieceSquares.length).toBe(4);
    pieceSquares.forEach((el) => {
      expect(el.dataset.color).toBe("I");
    });
  });

  it("respects gamemode INVIS by hiding filled state", () => {
    const invisBoard = [...board];
    invisBoard[2 * WIDTH] = "Z";

    render(
      <Grid
        board={invisBoard}
        gamemode={Gamemode.INVIS}
        piece={false}
        pos={pos}
        rot={rot}
        tetrominoes={tetrominoes}
        board_to_block={board_to_block}
        Gamemode={Gamemode}
      />
    );

    const squares = screen.getAllByTestId("square");
    const square0 = squares[0];

    expect(square0.dataset.color).toBe("Z");
    expect(square0.dataset.filled).toBe("false");
  });

  it("renders blocked squares", () => {
    const blockedBoard = [...board];
    blockedBoard[2* WIDTH + 5] = "X";

    render(
      <Grid
        board={blockedBoard}
        gamemode={Gamemode.NORMAL}
        piece={null}
        pos={pos}
        rot={rot}
        tetrominoes={tetrominoes}
        board_to_block={board_to_block}
        Gamemode={Gamemode}
      />
    );

    const blockedSquare = screen.getAllByTestId("square")[5];
    expect(blockedSquare.dataset.blocked).toBe("true");
  });
});
