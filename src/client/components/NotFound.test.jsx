import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { NotFound } from "./NotFound";
import { MemoryRouter } from "react-router-dom";

describe("NotFound component", () => {
  it("displays the not found message and link", () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    expect(screen.getByText("Page Not Found")).toBeInTheDocument();

    expect(
      screen.getByText((content, element) =>
        element.tagName.toLowerCase() === "p" &&
        content.includes("The page you're looking for doesn't exist.")
      )
    ).toBeInTheDocument();

    const link = screen.getByRole("link", { name: /home page/i });
    expect(link).toHaveAttribute("href", "/");
  });
});
