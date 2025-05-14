// Player.test.js
import { Player } from './Player';
import * as logger from './index.js';

describe('Player class', () => {
  let loginfoSpy;
  let logerrorSpy;

  beforeEach(() => {
    loginfoSpy = jest.spyOn(logger, 'loginfo').mockImplementation(() => {});
    logerrorSpy = jest.spyOn(logger, 'logerror').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('initializes with default values', () => {
    const player = new Player();
    expect(player.name).toBe('player');
    expect(player.room).toBe('lobby');
  });

  test('initializes with custom values', () => {
    const player = new Player('Alice', 'room1');
    expect(player.name).toBe('Alice');
    expect(player.room).toBe('room1');
  });

  test('renames to a valid new name', () => {
    const player = new Player('Bob');
    const result = player.rename('Charlie');

    expect(result).toBe(true);
    expect(player.name).toBe('Charlie');
    expect(loginfoSpy).toHaveBeenCalledWith('Bob renamed to Charlie');
    expect(logerrorSpy).not.toHaveBeenCalled();
  });

  test('fails to rename to an invalid name', () => {
    const player = new Player('Dana');
    const result = player.rename('Invalid Name!');

    expect(result).toBe(false);
    expect(player.name).toBe('Dana');
    expect(loginfoSpy).not.toHaveBeenCalled();
    expect(logerrorSpy).toHaveBeenCalledWith('Invalid Name! is not a valid name');
  });

  test('fails to rename to an empty string', () => {
    const player = new Player('Eve');
    const result = player.rename('');

    expect(result).toBe(false);
    expect(player.name).toBe('Eve');
    expect(loginfoSpy).not.toHaveBeenCalled();
    expect(logerrorSpy).toHaveBeenCalledWith(' is not a valid name');
  });
});
