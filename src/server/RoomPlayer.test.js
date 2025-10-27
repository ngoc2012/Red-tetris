import { expect, describe, it, beforeEach } from 'vitest'
import { RoomPlayer } from "./RoomPlayer.js";

describe("RoomPlayer", () => {
  it("should initialize with the correct name and default properties", () => {
    const player = new RoomPlayer("Alice");
    expect(player.name).toBe("Alice");
    expect(player.playing).toBe(false);
    expect(player.penalty).toBe(0);
    expect(player.score).toBe(0);
  });
});