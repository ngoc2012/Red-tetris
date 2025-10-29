import { expect, describe, it, beforeEach, vi } from 'vitest'
import { Player } from "./Player.js";

describe('Player', () => {
  it("should initialize with the correct name and room", () => {
    const player = new Player("Bob", "game_room");
    expect(player.name).toBe("Bob");
    expect(player.room).toBe("game_room");
  });

  it("should rename the player with a valid name", () => {
    const player = new Player("Bob");
    const result = player.rename("Charlie");
    expect(result).toBe(true);
    expect(player.name).toBe("Charlie");
  });

  it("should not rename the player with an invalid name", () => {
    const player = new Player("Bob");
    const result = player.rename("Ch@rlie!");
    expect(result).toBe(false);
    expect(player.name).toBe("Bob");
  });
  
  it("check_name should validate names correctly", () => {
    const validNames = ["Alice", "Bob123", "charlie"];
    const invalidNames = ["", "D@ve", "Eve!", "Frank#", "Gina$"];

    validNames.forEach(name => {
      const player = new Player("Test");
      expect(player.rename(name)).toBe(true);
    });

    invalidNames.forEach(name => {
      const player = new Player("Test");
      expect(player.rename(name)).toBe(false);
    });
  });
  
});