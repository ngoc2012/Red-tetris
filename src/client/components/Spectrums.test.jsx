import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Spectrum, Spectrums } from "./Spectrums";

describe("Spectrum component", () => {
  const mockInfo = {
    playerId: "player1",
    score: 1000,
    penalty: 2,
    spec: Array(10).fill(5),
  };

  it("renders header and footer correctly", () => {
    const { getByText } = render(<Spectrum info={mockInfo} />);
    expect(getByText("player1")).toBeInTheDocument();
    expect(getByText("1000")).toBeInTheDocument();
  });

  it("renders 200 cells", () => {
    const { container } = render(<Spectrum info={mockInfo} />);
    const cells = container.querySelectorAll(".spec_cell");
    expect(cells.length).toBe(200);
  });

  it("applies correct classnames to cells", () => {
    const { container } = render(<Spectrum info={mockInfo} />);
    const cells = Array.from(container.querySelectorAll(".spec_cell"));

    // Bottom 2 rows should be 'blocked'
    for (let i = 180; i < 200; i++) {
      expect(cells[i]).toHaveClass("blocked");
    }

    // Next 5 rows up from each column (row 13–17) should be 'filled'
    for (let col = 0; col < 10; col++) {
      for (let row = 15; row < 18; row++) {
        const index = row * 10 + col;
        expect(cells[index]).toHaveClass("filled");
      }
    }

    // Others should be 'empty'
    for (let i = 0; i < 130; i++) {
      expect(cells[i]).toHaveClass("empty");
    }
  });
});
