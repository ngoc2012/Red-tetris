// Room.test.js

import { Room, RoomPlayer } from "./Room.js";
import { Gamemode, Mode, Status } from "../common/enums.js";
import { LEVEL_UP, MAX_LEVEL } from "../common/constants.js";

jest.mock("./index.js", () => ({
  loginfo: jest.fn(),
}));

const mockIo = {
  to: jest.fn().mockReturnThis(),
  emit: jest.fn(),
};

describe("Room", () => {
  let room;

  beforeEach(() => {
    room = new Room(mockIo, "owner1");
  });

  test("initializes correctly", () => {
    expect(room.id).toBe("0");
    expect(room.mode).toBe(Mode.SINGLE);
    expect(room.gamemode).toBe(Gamemode.NORMAL);
    expect(room.level).toBe(0);
    expect(room.rows_cleared).toBe(0);
    expect(room.status).toBe(Status.WAITING);
    expect(room.owner).toBe("owner1");
    expect(room.players.size).toBe(0);
  });

  test("adds a player", () => {
    room.add_player("player1", "Alice");
    expect(room.players.has("player1")).toBe(true);
    expect(room.players.get("player1").name).toBe("Alice");
  });

  test("removes a player and transfers ownership", () => {
    room.add_player("player1", "Alice");
    room.remove_player("owner1");
    expect(room.players.has("owner1")).toBe(false);
    expect(room.owner).toBe("player1");
  });

  test("starts game with correct mode", () => {
    room.add_player("player1", "Alice");
    room.start_game();
    expect(room.status).toBe(Status.PLAYING);
    expect(room.mode).toBe(Mode.SINGLE);
    expect(room.players.get("player1").playing).toBe(true);
  });

  test("starts game in MULTI mode", () => {
    room.add_player("player1", "Alice");
    room.add_player("player2", "Bob");
    room.start_game();
    expect(room.mode).toBe(Mode.MULTI);
  });

  test("ends game", () => {
    room.end_game();
    expect(room.status).toBe(Status.WAITING);
  });

  test("updates and returns score", () => {
    room.add_player("player1", "Alice");
    const newScore = room.update_score("player1", 100);
    expect(newScore).toBe(100);
    expect(room.get_score("player1")).toBe(100);
  });

  test("updates spectrum", () => {
    room.add_player("player1", "Alice");
    const spec = [1, 2, 3];
    const updated = room.update_spectrum("player1", spec, 2);
    expect(updated.spectrum).toBe(spec);
    expect(updated.penalty).toBe(2);
  });

  test("game over sets playing false", () => {
    room.add_player("player1", "Alice");
    room.start_game();
    room.game_over("player1");
    expect(room.players.get("player1").playing).toBe(false);
  });

  test("clears rows and levels up", () => {
    room.gamemode = Gamemode.ACCEL;
    room.clear_rows(LEVEL_UP);
    expect(room.level).toBe(1);
    expect(mockIo.to).toHaveBeenCalledWith(room.id);
    expect(mockIo.emit).toHaveBeenCalledWith("level", 1);
  });

  test("does not level up if not ACCEL mode or max level", () => {
    room.level = MAX_LEVEL;
    room.clear_rows(LEVEL_UP);
    expect(room.level).toBe(MAX_LEVEL);
  });

  test("returns correct spectrums", () => {
    room.add_player("p1", "A");
    room.add_player("p2", "B");
    room.update_spectrum("p2", [1, 2], 3);
    const specs = room.spectrums("p1");
    expect(specs.p2.score).toBe(0);
    expect(specs.p2.penalty).toBe(3);
    expect(specs.p2.spec).toEqual([1, 2]);
  });

  test("get_info returns correct shape", () => {
    room.add_player("p1", "Alice");
    const info = room.get_info();
    expect(info).toHaveProperty("id");
    expect(info).toHaveProperty("players");
    expect(info.players[0]).toMatchObject({
      id: "p1",
      name: "Alice",
      playing: false,
      score: 0,
      penalty: 0,
      spectrum: expect.any(Array),
    });
  });

  test("players_left only returns active players", () => {
    room.add_player("p1", "Alice");
    room.add_player("p2", "Bob");
    room.start_game();
    room.game_over("p1");
    const left = room.players_left;
    expect(left.size).toBe(1);
    expect(left.has("p2")).toBe(true);
  });

  test("Room.count returns stringified room counter", () => {
    expect(typeof Room.count()).toBe("string");
  });
});
