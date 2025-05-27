import React from "react";
import { render } from "@testing-library/react";
import { useGameConnect } from "./GameConnect.jsx";

// Mock dependencies
jest.mock("../socket.js", () => ({
  on: jest.fn(),
  off: jest.fn(),
}));

jest.mock("../store.js", () => ({
  store: { dispatch: jest.fn() },
  setStatus: jest.fn((val) => ({ type: "SET_STATUS", payload: val })),
  setMode: jest.fn((val) => ({ type: "SET_MODE", payload: val })),
  setGamemode: jest.fn((val) => ({ type: "SET_GAMEMODE", payload: val })),
  setLevel: jest.fn((val) => ({ type: "SET_LEVEL", payload: val })),
}));

jest.mock("../utils/utils.js", () => ({
  reset: jest.fn(),
  add_penalty: jest.fn(),
}));

jest.mock("../streams.js", () => {
  const stream = jest.fn(() => []);
  stream.mockReturnValue([]);
  stream.mockImplementation(() => {
    const value = [];
    return jest.fn(() => value);
  });
  return {
    next_pieces$: jest.fn(() => []),
  };
});

describe("useGameConnect", () => {
  const socket = require("../socket.js");
  const { store, setStatus, setGamemode, setLevel, setMode } = require("../store.js");
  const { reset } = require("../utils/utils.js");

  const TestComponent = () => {
    useGameConnect();
    return <div>Test</div>;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("registers and cleans up socket listeners", () => {
    render(<TestComponent />);
    expect(socket.on).toHaveBeenCalledWith("game_prep", expect.any(Function));
    expect(socket.on).toHaveBeenCalledWith("game_start", expect.any(Function));
    expect(socket.on).toHaveBeenCalledWith("game_over", expect.any(Function));
    expect(socket.on).toHaveBeenCalledWith("game_win", expect.any(Function));
    expect(socket.on).toHaveBeenCalledWith("next_piece", expect.any(Function));
    expect(socket.on).toHaveBeenCalledWith("penalty", expect.any(Function));
    expect(socket.on).toHaveBeenCalledWith("level", expect.any(Function));
    expect(socket.on).toHaveBeenCalledWith("gamemode", expect.any(Function));
  });

  it("handles game_start event", () => {
    render(<TestComponent />);
    const game_start = socket.on.mock.calls.find(([event]) => event === "game_start")[1];

    const room = { mode: "classic", gamemode: "time", level: 5 };
    game_start(room);

    expect(store.dispatch).toHaveBeenCalledWith(setMode("classic"));
    expect(store.dispatch).toHaveBeenCalledWith(setGamemode("time"));
    expect(store.dispatch).toHaveBeenCalledWith(setLevel(5));
    expect(store.dispatch).toHaveBeenCalledWith(setStatus("playing"));
  });

  it("handles game_prep event", () => {
    render(<TestComponent />);
    const game_prep = socket.on.mock.calls.find(([event]) => event === "game_prep")[1];

    game_prep();

    expect(reset).toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith(setStatus("starting"));
  });

  it("handles game_win event", () => {
    render(<TestComponent />);
    const game_win = socket.on.mock.calls.find(([event]) => event === "game_win")[1];

    console.log = jest.fn(); // suppress "GG" log

    game_win();

    expect(console.log).toHaveBeenCalledWith("GG");
    expect(store.dispatch).toHaveBeenCalledWith(setStatus("game_win"));
  });
});
