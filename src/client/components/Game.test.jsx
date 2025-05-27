import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { Game } from "./Game";
import { NotFound } from "./NotFound";

// Mocks
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ roomid: "room123", name: "John" }),
}));

jest.mock("../socket", () => ({
  emit: jest.fn(),
}));

jest.mock("../store.js", () => ({
  store: { dispatch: jest.fn() },
  setRoomId: jest.fn((id) => ({ type: "SET_ROOM_ID", payload: id })),
  setStatus: jest.fn((s) => ({ type: "SET_STATUS", payload: s })),
  setGamemode: jest.fn((gm) => ({ type: "SET_GAMEMODE", payload: gm })),
  setMode: jest.fn((m) => ({ type: "SET_MODE", payload: m })),
  setLevel: jest.fn((l) => ({ type: "SET_LEVEL", payload: l })),
}));

jest.mock("../utils/utils.js", () => ({
  reset: jest.fn(),
}));

jest.mock("./Board.jsx", () => ({
  Board: () => <div data-testid="board">Board</div>,
}));

jest.mock("./Info.jsx", () => ({
  Info: () => <div data-testid="info">Info</div>,
}));

jest.mock("./NotFound.jsx", () => ({
  NotFound: () => <div data-testid="notfound">Not Found</div>,
}));

jest.mock("./GameConnect.jsx", () => ({
  useGameConnect: jest.fn(),
}));

jest.mock("./Keyboard.jsx", () => ({
  useKeyboard: jest.fn(),
}));

jest.mock("./GameLoop.jsx", () => ({
  useGameLoop: jest.fn(),
}));

describe("Game component", () => {
  const socket = require("../socket");
  const { store, setRoomId, setStatus, setGamemode, setMode, setLevel } = require("../store.js");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading initially", () => {
    socket.emit.mockImplementation(() => {}); // Do nothing yet
    render(<Game />);
    expect(screen.getByText("Loading")).toBeInTheDocument();
  });

  it("renders Board and Info when room is found", async () => {
    socket.emit.mockImplementation((event, roomid, callback) => {
      if (event === "join_room") {
        callback({
          success: true,
          room: {
            status: "playing",
            gamemode: "time",
            mode: "classic",
            level: 3,
          },
        });
      }
    });

    render(<Game />);

    await waitFor(() => {
      expect(screen.getByTestId("board")).toBeInTheDocument();
      expect(screen.getByTestId("info")).toBeInTheDocument();
    });

    expect(store.dispatch).toHaveBeenCalledWith(setRoomId("room123"));
    expect(store.dispatch).toHaveBeenCalledWith(setStatus("playing"));
    expect(store.dispatch).toHaveBeenCalledWith(setGamemode("time"));
    expect(store.dispatch).toHaveBeenCalledWith(setMode("classic"));
    expect(store.dispatch).toHaveBeenCalledWith(setLevel(3));
  });

  it("renders NotFound when room is not found", async () => {
    socket.emit.mockImplementation((event, roomid, callback) => {
      if (event === "join_room") {
        callback({ success: false });
      }
    });

    render(<Game />);

    await waitFor(() => {
      expect(screen.getByTestId("notfound")).toBeInTheDocument();
    });

    expect(store.dispatch).not.toHaveBeenCalledWith(setRoomId("room123"));
  });
});
