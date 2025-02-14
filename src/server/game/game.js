// https://tetris.wiki/Super_Rotation_System
import { tetrominoes } from './tetrominoes.js';

export function generateNewPiece() {
    const pieces = Object.keys(tetrominoes);
    const randomIndex = Math.floor(Math.random() * pieces.length);
    const type = pieces[randomIndex];
    const rotations = tetrominoes[type];
    const rotationIndex = 0; // Start with the first rotation

    // Define the initial position (e.g., centered at the top of the board)
    const initialPosition = { x: 3, y: 0 }; // Adjust x based on your board width

    return {
        type,
        rotationIndex,
        position: initialPosition,
        shape: rotations[rotationIndex]
    };
}