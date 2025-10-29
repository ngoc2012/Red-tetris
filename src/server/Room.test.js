import { expect, describe, it, beforeEach, vi } from 'vitest'
import { Room } from "./Room.js";
import { RoomPlayer } from "./RoomPlayer.js";
import { Gamemode, Mode, Status } from '../common/enums.js';
import { LEVEL_UP, MAX_LEVEL } from '../common/constants.js';

describe("Room", () => {
  let room;

  beforeEach(() => {
    Room.room_counter = 0; // 👈 reset before each test
    room = new Room(null, "owner1");
  });

  it("constructor initializes properties correctly", () => {
    expect(room.io).toBeNull();
    expect(room.id).toBe("0");
    expect(room.mode).toBeDefined(Mode.SINGLE);
    expect(room.gamemode).toBe(Gamemode.NORMAL);
    expect(room.level).toBe(0);
    expect(room.rows_cleared).toBe(0);
    expect(room.status).toBe(Status.WAITING);
    expect(room.owner).toBe("owner1");
    expect(room.players).toBeInstanceOf(Map);
    expect(room.deleteTimeout).toBeNull();
  });

  it("should start with room_counter = 0", () => {
    expect(room.id).toBe("0");
    expect(Room.room_counter).toBe(1);
  });

  it("should increment room_counter", () => {
    new Room(null, "owner2");
    expect(Room.room_counter).toBe(2);
  });

  it("players_left returns only players who are playing", () => {
    const player1 = new RoomPlayer("player1");
    player1.playing = true;
    const player2 = new RoomPlayer("player2");
    player2.playing = false;
    room.players.set("p1", player1);
    room.players.set("p2", player2);

    const playersLeft = room.players_left;
    expect(playersLeft.size).toBe(1);
    expect(playersLeft.has("p1")).toBe(true);
    expect(playersLeft.has("p2")).toBe(false);
  });

  it("is_playing returns true when status is PLAYING", () => {
    room.status = Status.PLAYING;
    expect(room.is_playing).toBe(true);
  });

  it("is_playing returns false when status is not PLAYING", () => {
    room.status = Status.WAITING;
    expect(room.is_playing).toBe(false);
  });

  it("get_info returns correct room information", () => {
    const player1 = new RoomPlayer("player1");
    player1.playing = true;
    player1.score = 100;
    const player2 = new RoomPlayer("player2");
    player2.playing = false;
    player2.score = 50;
    room.players.set("p1", player1);
    room.players.set("p2", player2);

    const info = room.get_info();
    expect(info).toEqual({
      id: "0",
      mode: Mode.SINGLE,
      gamemode: Gamemode.NORMAL,
      level: 0,
      rows_cleared: 0,
      status: Status.WAITING,
      players: [
        { id: "p1", name: "player1", playing: true, score: 100, penalty: 0, spectrum: Array.from({ length: 10 }).fill(0) },
        { id: "p2", name: "player2", playing: false, score: 50, penalty: 0, spectrum: Array.from({ length: 10 }).fill(0) },
      ],
    });
  });

  it("get_score returns correct score for existing player", () => {
    const player = new RoomPlayer("player1");
    player.score = 150;
    room.players.set("p1", player);

    const score = room.get_score("p1");
    expect(score).toBe(150);
  });

  it("get_score returns null for non-existing player", () => {
    const score = room.get_score("nonexistent");
    expect(score).toBeNull();
  });

  it("add_player adds a new player to the room", () => {
    room.add_player("p1", "player1");
    expect(room.players.size).toBe(1);
    expect(room.players.get("p1").name).toBe("player1");
  });
  
  it("remove_player removes a player from the room", () => {
    room.add_player("p1", "player1");
    room.remove_player("p1");
    expect(room.players.size).toBe(0);
  });

  it("start_game sets room and players to playing state", () => {
    room.add_player("p1", "player1");
    room.add_player("p2", "player2");
    room.start_game();

    expect(room.status).toBe(Status.PLAYING);
    expect(room.mode).toBe(Mode.MULTI);
    room.players.forEach((player) => {
      expect(player.playing).toBe(true);
      expect(player.score).toBe(0);
    });
  });

  it("end_game sets room status to WAITING", () => {
    room.status = Status.PLAYING;
    room.end_game();
    expect(room.status).toBe(Status.WAITING);
  });

  it("spectrums returns all other players' spectrums", () => {
    const player1 = new RoomPlayer("player1");
    player1.spectrum = [1,2,3];
    const player2 = new RoomPlayer("player2");
    player2.spectrum = [4,5,6];

    room.players.set("p1", player1);
    room.players.set("p2", player2);

    const result = room.spectrums("p1");

    expect(result).toEqual({
      p2: {
        playerId: "player2",
        score: 0,
        spec: [4,5,6],
        penalty: 0
      }
    });
  });

  it("game_over", () => {
    const player1 = new RoomPlayer("player1");
    room.players.set("p1", player1);

    room.game_over("p1");

    expect(player1.playing).toBe(false);
  });

  it("game_over returns null for non-existing player", () => {
    const result = room.game_over("nonexistent");
    expect(result).toBeNull();
  });

  it("update_spectrum updates the player's spectrum and penalty", () => {
    const player1 = new RoomPlayer("player1");
    room.players.set("p1", player1);

    const result = room.update_spectrum("p1", [1, 2, 3], 0);

    // ensure it's the instance and it has expected fields
    expect(result).toBeInstanceOf(RoomPlayer);
    expect(result).toMatchObject({
      name: "player1",
      penalty: 0,
      playing: false,
      score: 0,
      spectrum: [1, 2, 3]
    });

    expect(player1.spectrum).toEqual([1, 2, 3]);
    expect(player1.penalty).toBe(0);
  });

  it("update_spectrum returns null for non-existing player", () => {
    const result = room.update_spectrum("nonexistent", [1,2,3], 0);
    expect(result).toBeNull();
  });

  it("update_score updates the player's score", () => {
    const player1 = new RoomPlayer("player1");
    room.players.set("p1", player1);

    room.update_score("p1", 200);

    expect(player1.score).toBe(200);
  });

  it("update_score does nothing for non-existing player", () => {
    expect(() => room.update_score("nonexistent", 200)).not.toThrow();
  });

  it("update_score returns null for non-existing player", () => {
    const result = room.update_score("nonexistent", 200);
    expect(result).toBeNull();
  });

  it("clear_rows increments rows_cleared when gamemode is ACCEL", () => {
    room.gamemode = Gamemode.ACCEL;
    room.level = 0;
    room.rows_cleared = 1;

    // mock io and emit
    room.io = { to: vi.fn(() => ({ emit: vi.fn() })) };
    room.id = "room1"; // ensure this.id exists

    const initialRows = room.rows_cleared;
    room.clear_rows(LEVEL_UP);
    expect(room.rows_cleared).toBe(initialRows);
    expect(room.level).toBe(1);
  });

  it("clear_rows does nothing when gamemode is not ACCEL", () => {
    room.gamemode = Gamemode.NORMAL;
    room.level = 0;
    room.rows_cleared = 1;

    const initialRows = room.rows_cleared;
    room.clear_rows(LEVEL_UP);
    expect(room.rows_cleared).toBe(initialRows);
    expect(room.level).toBe(0);
  });

  it("clear_rows does nothing when level is at MAX_LEVEL", () => {
    room.gamemode = Gamemode.ACCEL;
    room.level = MAX_LEVEL;
    room.rows_cleared = 1;

    const initialRows = room.rows_cleared;
    room.clear_rows(LEVEL_UP);
    expect(room.rows_cleared).toBe(initialRows);
    expect(room.level).toBe(MAX_LEVEL);
  });

  it("clear_rows does nothing if not enough rows cleared to level up", () => {
    room.gamemode = Gamemode.ACCEL;
    room.level = 0;
    room.rows_cleared = 0;

    room.io = { to: vi.fn(() => ({ emit: vi.fn() })) };
    room.id = "room1"; // ensure this.id exists

    room.clear_rows(LEVEL_UP - 1);
    expect(room.rows_cleared).toBe(LEVEL_UP - 1);
    expect(room.level).toBe(0);
  });

});
