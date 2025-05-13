import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App.jsx";
import { MemoryRouter } from "react-router-dom";
import * as socket from "../socket.js";


// --- Manual mock redux useDispatch ---
const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
}));

// --- Mock initSocket ---
jest.mock("../socket.js", () => ({
  initSocket: jest.fn(),
}));

// --- Mock components used in routes ---
jest.mock("./Lobby.jsx", () => ({
  Lobby: () => <div>Lobby Page</div>,
}));
jest.mock("./Game.jsx", () => ({
  Game: () => <div>Game Page</div>,
}));
jest.mock("./History.jsx", () => ({
  History: () => <div>History Page</div>,
}));
jest.mock("./NotFound.jsx", () => ({
  NotFound: () => <div>404 Not Found</div>,
}));

describe("App", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("calls initSocket with dispatch", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    expect(socket.initSocket).toHaveBeenCalledWith(mockDispatch);
  });

  it("renders Lobby on '/'", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText("Lobby Page")).toBeInTheDocument();
  });

  it("renders Game on '/room123/player1'", () => {
    render(
      <MemoryRouter initialEntries={["/room123/player1"]}>
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
