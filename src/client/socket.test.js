import { initSocket } from "./socket";
import { io } from "socket.io-client";
import { setScore, setId } from "./store";

jest.mock("socket.io-client");
jest.mock("./store");

describe("initSocket", () => {
  let socketMock;
  let dispatchMock;

  beforeEach(() => {
    dispatchMock = jest.fn();

    // Mock the socket
    socketMock = {
      on: jest.fn(),
      id: "mock-socket-id"
    };

    io.mockReturnValue(socketMock);
  });

  it("sets up socket event listeners", () => {
    initSocket(dispatchMock);

    expect(socketMock.on).toHaveBeenCalledWith("connected", expect.any(Function));
    expect(socketMock.on).toHaveBeenCalledWith("score_update", expect.any(Function));
  });

  it("dispatches setId on 'connected' event", () => {
    initSocket(dispatchMock);

    const connectedHandler = socketMock.on.mock.calls.find(call => call[0] === "connected")[1];
    connectedHandler({ id: "abc123" });

    expect(dispatchMock).toHaveBeenCalledWith(setId("abc123"));
  });

  it("dispatches setScore on 'score_update' if id matches socket.id", () => {
    initSocket(dispatchMock);

    const scoreHandler = socketMock.on.mock.calls.find(call => call[0] === "score_update")[1];
    scoreHandler({ id: "mock-socket-id", score: 42 });

    expect(dispatchMock).toHaveBeenCalledWith(setScore(42));
  });

  it("does not dispatch setScore if id does not match socket.id", () => {
    initSocket(dispatchMock);

    const scoreHandler = socketMock.on.mock.calls.find(call => call[0] === "score_update")[1];
    scoreHandler({ id: "another-id", score: 99 });

    expect(dispatchMock).not.toHaveBeenCalledWith(setScore(99));
  });
});
