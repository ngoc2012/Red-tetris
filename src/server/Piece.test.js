import { Piece } from './Piece.js';
import { tetrominoes } from '../common/tetrominoes.js';

describe('Piece class', () => {
  const tetrominoKeys = Object.keys(tetrominoes);

  afterEach(() => {
    jest.restoreAllMocks(); // Reset Math.random mock after each test
  });

  it('should create a piece with a type from tetrominoes', () => {
    const piece = new Piece();
    expect(tetrominoKeys).toContain(piece.type);
  });

  it('should select correct type based on mocked Math.random', () => {
    // Mock Math.random to return a specific index
    jest.spyOn(Math, 'random').mockReturnValue(0); // Should give index 0

    const piece = new Piece();
    expect(piece.type).toBe(tetrominoKeys[0]);
  });

  it('should create different types randomly (non-deterministically)', () => {
    const types = new Set();
    for (let i = 0; i < 100; i++) {
      types.add(new Piece().type);
    }

    // At least 2+ different types are expected if randomness is working
    expect(types.size).toBeGreaterThan(1);
    types.forEach(type => {
      expect(tetrominoKeys).toContain(type);
    });
  });
});
