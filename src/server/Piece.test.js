import { expect, describe, it } from 'vitest'
import { Piece } from './Piece.js';
import { tetrominoes } from '../common/tetrominoes.js';

describe('Piece class', () => {
  const tetrominoKeys = Object.keys(tetrominoes); // ['I', 'J', 'L', 'O', 'S', 'T', 'Z']

  it('should create a piece with a type from tetrominoes', () => {
    const piece = new Piece();
    expect(tetrominoKeys).toContain(piece.type);
  });

  it('should create different types randomly (non-deterministically)', () => {
    const types = new Set();
    for (let i = 0; i < 8; i++) {
      types.add(new Piece().type);
    }

    // At least 2+ different types are expected if randomness is working
    expect(types.size).toBeGreaterThan(1);
    types.forEach(type => {
      expect(tetrominoKeys).toContain(type);
    });
  });
});
