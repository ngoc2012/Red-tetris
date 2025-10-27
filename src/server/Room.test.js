import { expect, describe, it, beforeEach } from 'vitest'
import { Room, RoomPlayer } from "./Room.js";

describe("Room", () => {
  let room;

  beforeEach(() => {
    Room.room_counter = 0; // 👈 reset before each test
    room = new Room(null, "owner1");
  });

  it("should start with room_counter = 0", () => {
    expect(room.id).toBe("0");
    expect(Room.room_counter).toBe(1);
  });

  it("should increment room_counter", () => {
    new Room(null, "owner2");
    expect(Room.room_counter).toBe(2);
  });
});
