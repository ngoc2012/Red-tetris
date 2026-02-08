import { describe, it, expect, vi, beforeEach } from 'vitest'
import { WIDTH, BUFFER } from '../../common/constants.js'
import { PieceState } from '../../common/enums.js'

let mockPiece = 'T'
let mockRot = 0
let mockPos = 3
let mockNextPieces = ['I', 'S']
let mockFallCount = 0
let mockLockCount = 0
let mockState = PieceState.FALLING
let mockBoard = Array.from({ length: (20 + BUFFER) * WIDTH }).fill('')

const mockDispatch = vi.fn()
const mockEmit = vi.fn()

vi.mock('../streams.js', () => ({
  piece$: (v) => { if (v !== undefined) mockPiece = v; return mockPiece },
  rot$: (v) => { if (v !== undefined) mockRot = v; return mockRot },
  pos$: (v) => { if (v !== undefined) mockPos = v; return mockPos },
  next_pieces$: (v) => { if (v !== undefined) mockNextPieces = v; return mockNextPieces },
  fall_count$: (v) => { if (v !== undefined) mockFallCount = v; return mockFallCount },
  lock_count$: (v) => { if (v !== undefined) mockLockCount = v; return mockLockCount },
  state$: (v) => { if (v !== undefined) mockState = v; return mockState },
}))

vi.mock('../socket.js', () => ({
  default: { emit: (...args) => mockEmit(...args) },
}))

vi.mock('../store.js', () => ({
  store: {
    dispatch: (...args) => mockDispatch(...args),
    getState: () => ({
      game_state: { board: mockBoard, status: 'playing' },
    }),
  },
  setStatus: (v) => ({ type: 'game_state/setStatus', payload: v }),
  setBoard: (v) => ({ type: 'game_state/setBoard', payload: v }),
}))

vi.mock('./utils.js', () => ({
  block_to_board: (pos, col, row) => [
    ((pos % 10) + col) % 10,
    Math.floor(pos / 10) + row + ((pos % 10) + col >= 10),
  ],
  add_block_to_board: vi.fn(),
  clear_full_rows: vi.fn(() => 0),
  next_rot: vi.fn(() => (mockRot + 1) % 4),
}))

import { init_new_piece, place_piece, can_move } from './move_piece.js'
import { add_block_to_board, clear_full_rows } from './utils.js'

describe('move_piece', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPiece = 'T'
    mockRot = 0
    mockPos = 3
    mockNextPieces = ['I', 'S']
    mockFallCount = 0
    mockLockCount = 0
    mockState = PieceState.FALLING
    mockBoard = Array.from({ length: (20 + BUFFER) * WIDTH }).fill('')
  })

  describe('init_new_piece', () => {
    it('resets fall and lock counts to 0', () => {
      mockFallCount = 10
      mockLockCount = 5
      init_new_piece()
      expect(mockFallCount).toBe(0)
      expect(mockLockCount).toBe(0)
    })

    it('sets pos to 3 and rot to 0', () => {
      mockPos = 50
      mockRot = 2
      init_new_piece()
      expect(mockPos).toBe(3)
      expect(mockRot).toBe(0)
    })

    it('takes the first piece from next_pieces', () => {
      mockNextPieces = ['I', 'S', 'T']
      init_new_piece()
      expect(mockPiece).toBe('I')
      expect(mockNextPieces).toEqual(['S', 'T'])
    })

    it('sets state to FALLING', () => {
      mockState = PieceState.LOCKED
      init_new_piece()
      expect(mockState).toBe(PieceState.FALLING)
    })

    it('emits next_piece to server', () => {
      init_new_piece()
      expect(mockEmit).toHaveBeenCalledWith('next_piece')
    })
  })

  describe('place_piece', () => {
    it('calls add_block_to_board and clear_full_rows', () => {
      place_piece()
      expect(add_block_to_board).toHaveBeenCalled()
      expect(clear_full_rows).toHaveBeenCalled()
    })

    it('dispatches game_over when piece is in buffer zone', () => {
      // Put a block in the buffer zone
      mockBoard = Array.from({ length: (20 + BUFFER) * WIDTH }).fill('')
      mockBoard[0] = 'T'
      place_piece()
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'game_state/setStatus',
        payload: 'game_over',
      })
    })

    it('emits cleared_a_line when rows are cleared', () => {
      clear_full_rows.mockReturnValueOnce(2)
      // Mock audio element
      const mockAudio = { muted: true, play: vi.fn(() => Promise.resolve()) }
      vi.spyOn(document, 'getElementById').mockReturnValue(mockAudio)

      place_piece()
      expect(mockEmit).toHaveBeenCalledWith('cleared_a_line', 2)
    })

    it('calls init_new_piece after placing (no game over)', () => {
      // After place_piece, init_new_piece is called which emits "next_piece"
      place_piece()
      expect(mockEmit).toHaveBeenCalledWith('next_piece')
    })
  })

  describe('can_move', () => {
    it('returns true for valid position on empty board', () => {
      mockPiece = 'O'
      mockRot = 0
      mockPos = BUFFER * WIDTH + 3
      const result = can_move(BUFFER * WIDTH + 3, 0, 0)
      expect(result).toBe(true)
    })

    it('returns false when piece would go below the board', () => {
      mockPiece = 'O'
      // Position at the very bottom
      const bottomPos = (20 + BUFFER) * WIDTH + 3
      const result = can_move(bottomPos, 0, 0)
      expect(result).toBe(false)
    })

    it('returns false when position is occupied', () => {
      mockPiece = 'O'
      mockBoard = Array.from({ length: (20 + BUFFER) * WIDTH }).fill('')
      // Fill the area where the piece would go
      mockBoard[BUFFER * WIDTH + 4] = 'T'
      const result = can_move(BUFFER * WIDTH + 3, 0, 0)
      expect(result).toBe(false)
    })
  })
})
