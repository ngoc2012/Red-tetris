import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App.jsx";
import { MemoryRouter } from "react-router-dom";


jest.mock("react-redux", () => ({ useDispatch: jest.fn() }));
jest.mock("../socket.js", () => ({ initSocket: jest.fn() }));
jest.mock("./Lobby.jsx", () => ({ Lobby: () => <>Lobby Page</> }));
jest.mock("./Game.jsx", () => ({ Game: () => <>Game Page</> }));
jest.mock("./History.jsx", () => ({ History: () => <>History Page</> }));
jest.mock("./NotFound.jsx", () => ({ NotFound: () => <>404 Not Found</> }));

describe("App", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders Lobby on '/'", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText("Lobby Page")).toBeInTheDocument();
  });

  it("renders Game on '/0/player1'", () => {
    render(
      <MemoryRouter initialEntries={["/0/player1"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText("Game Page")).toBeInTheDocument();
  });

  it("renders History on '/history'", () => {
    render(
      <MemoryRouter initialEntries={["/history"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText("History Page")).toBeInTheDocument();
  });

  it("renders NotFound on unmatched route", () => {
    render(
      <MemoryRouter initialEntries={["/unknown"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText("404 Not Found")).toBeInTheDocument();
  });
});
