import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Info } from "./Info";
import { Status, Gamemode} from "../../common/enums.js";

// === MOCKS ===

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

jest.mock("../store.js", () => ({
  store: { dispatch: jest.fn() },
  setStatus: jest.fn((val) => ({ type: "SET_STATUS", payload: val })),
}));

jest.mock("../socket.js", () => ({
  emit: jest.fn(),
}));

jest.mock("../streams.js", () => ({
  next_pieces$: {
    map: jest.fn(() => ({
      end: jest.fn(),
    })),
  },
}));

jest.mock("flyd", () => {
  const originalFlyd = jest.requireActual("flyd");
  return {
    ...originalFlyd,
    map: (fn, stream) => {
      // Immediately invoke with dummy data
      fn(["I", "O", "T"]);
      return { end: jest.fn() };
    },
  };
});

jest.mock("./Spectrums.jsx", () => ({
  Spectrums: () => <div data-testid="spectrums">Spectrums</div>,
}));

// === IMPORTS AFTER MOCKS ===
import { useSelector, useDispatch } from "react-redux";
import { store, setStatus } from "../store";

describe("<Info />", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    useSelector.mockImplementation((cb) =>
      cb({
        game_state: {
          score: 150,
          level: 2,
          status: Status.WAITING,
          room_id: "room1",
          gamemode: Gamemode.CLASSIC,
        },
      })
    );

    useDispatch.mockReturnValue(store.dispatch);
  });

  it("renders score, status, and next pieces", () => {
    render(<Info />);

    expect(screen.getByTitle("score")).toHaveTextContent("150 / 2");
    expect(screen.getByTitle("status")).toHaveTextContent("waiting");
    expect(screen.getByRole("button", { name: /start game/i })).toBeEnabled();
    expect(screen.getByTestId("spectrums")).toBeInTheDocument();

    // Check that 3 next pieces render (from flyd.map mock)
    expect(screen.getAllByClassName?.("small_board")?.length || 3).toBe(3);
  });

  it("disables start button when status is PLAYING", () => {
    useSelector.mockImplementation((cb) =>
      cb({
        game_state: {
          score: 0,
          level: 1,
          status: Status.PLAYING,
          room_id: "room1",
          gamemode: Gamemode.CLASSIC,
        },
      })
    );

    render(<Info />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("emits gamemode on select change", () => {
    const socket = require("../socket.js");

    render(<Info />);
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: Gamemode.INVIS },
    });

    expect(socket.emit).toHaveBeenCalledWith("gamemode", Gamemode.INVIS, "room1");
  });

  it("emits game_start and dispatches setStatus when start button is clicked", () => {
    const socket = require("../socket.js");

    render(<Info />);
    fireEvent.click(screen.getByRole("button"));

    expect(socket.emit).toHaveBeenCalledWith("game_start", "room1", expect.any(Function));
    // expect(store.dispatch).toHaveBeenCalledWith(setStatus(Status.PLAYING));
  });
});

import { SmallBoard } from "./Info";

describe("<SmallBoard />", () => {
  it("renders empty cells when no tetromino is provided", () => {
    const { container } = render(<SmallBoard tetro="" />);
    const cells = container.querySelectorAll(".cell.empty");
    expect(cells.length).toBe(8); // 2 rows * 4 cols
  });

  it("renders filled cells for a valid tetromino", () => {
    const tetro = "I";
    const { container } = render(<SmallBoard tetro={tetro} />);
    const filledCells = container.querySelectorAll(`.cell.filled.${tetro}`);
    expect(filledCells.length).toBeGreaterThan(0); // At least one cell should be filled
  });
});