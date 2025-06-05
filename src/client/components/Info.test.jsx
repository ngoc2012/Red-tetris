import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";
import { Info } from "../components/Info";
import * as enums from "../../common/enums";
import * as storeActions from "../store";

// Mock socket
jest.mock("../socket.js", () => ({
  emit: jest.fn(),
}));

// Mock Spectrums
jest.mock("../components/Spectrums.jsx", () => ({
  Spectrums: () => <div data-testid="spectrums">Spectrums</div>,
}));

// Mock flyd stream
jest.mock("../streams.js", () => ({
  next_pieces$: {
    map: jest.fn(() => ({
      end: jest.fn(),
    })),
  },
}));

const mockStore = configureStore([thunk]);

describe("Info component", () => {
  let store;
  let dispatchMock;

  beforeEach(() => {
    dispatchMock = jest.fn();
    store = mockStore({
      game_state: {
        status: enums.Status.WAITING,
        score: 1200,
        room_id: "test-room",
        gamemode: enums.Gamemode.CLASSIC,
        level: 3,
      },
    });
    store.dispatch = dispatchMock;
  });

  test("renders score, status, button, mode selector, and Spectrums", () => {
    render(
      <Provider store={store}>
        <Info />
      </Provider>
    );

    expect(screen.getByTitle("score")).toHaveTextContent("1200 / 3");
    expect(screen.getByTitle("status")).toHaveTextContent(enums.Status.WAITING);
    expect(screen.getByRole("button", { name: /start game/i })).toBeEnabled();
    expect(screen.getByTestId("spectrums")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveValue(enums.Gamemode.CLASSIC);
  });

  test("disables start button when status is PLAYING", () => {
    const playingStore = mockStore({
      game_state: {
        ...store.getState().game_state,
        status: enums.Status.PLAYING,
      },
    });

    render(
      <Provider store={playingStore}>
        <Info />
      </Provider>
    );

    expect(screen.getByRole("button", { name: /start game/i })).toBeDisabled();
  });

  test("calls socket.emit and dispatches setStatus on successful start", () => {
    const mockEmit = require("../socket.js").emit;
    mockEmit.mockImplementation((event, roomId, callback) => {
      if (event === "game_start") callback({ success: true });
    });

    render(
      <Provider store={store}>
        <Info />
      </Provider>
    );

    const button = screen.getByRole("button", { name: /start game/i });
    fireEvent.click(button);

    expect(mockEmit).toHaveBeenCalledWith("game_start", "test-room", expect.any(Function));
    expect(dispatchMock).toHaveBeenCalledWith(storeActions.setStatus(enums.Status.PLAYING));
  });

  test("sends correct gamemode on change", () => {
    const mockEmit = require("../socket.js").emit;

    render(
      <Provider store={store}>
        <Info />
      </Provider>
    );

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: enums.Gamemode.SPRINT } });

    expect(mockEmit).toHaveBeenCalledWith("gamemode", enums.Gamemode.SPRINT, "test-room");
  });
});
