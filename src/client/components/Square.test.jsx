import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Square } from "./Square";

describe("Square component", () => {
  it("renders with 'blocked' class if blocked is true", () => {
    const { container } = render(<Square blocked={true} />);
    expect(container.firstChild).toHaveClass("blocked");
  });

  it("renders with 'filled' and color classes if filled is true and blocked is false", () => {
    const { container } = render(<Square filled={true} color="red" />);
    expect(container.firstChild).toHaveClass("filled");
    expect(container.firstChild).toHaveClass("red");
  });

  it("renders with 'empty' class if not filled and not blocked", () => {
    const { container } = render(<Square />);
    expect(container.firstChild).toHaveClass("empty");
  });

  it("blocked takes precedence over filled and color", () => {
    const { container } = render(<Square blocked={true} filled={true} color="blue" />);
    expect(container.firstChild).toHaveClass("blocked");
    expect(container.firstChild).not.toHaveClass("filled");
    expect(container.firstChild).not.toHaveClass("blue");
  });
});
