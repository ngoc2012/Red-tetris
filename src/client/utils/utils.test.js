import { describe, it, expect, vi, beforeEach } from 'vitest'
import { WIDTH, BUFFER } from '../../common/constants.js'
import { Status } from '../../common/enums.js'

let mockPiece = 'T'
let mockRot = 0
let mockPos = 3
let mockNextPieces = []
let mockBoard = Array.from({ length: (20 + BUFFER) * WIDTH }).fill('')
let mockStatus = 'playing'

const mockDispatch = vi.fn()

vi.mock('../streams.js', () => ({
  piece$: (v) => { if (v !== undefined) mockPiece = v; return mockPiece },
  rot$: (v) => { if (v !== undefined) mockRot = v; return mockRot },
  pos$: (v) => { if (v !== undefined) mockPos = v; return mockPos },
  next_pieces$: (v) => { if (v !== undefined) mockNextPieces = v; return mockNextPieces },
}))

vi.mock('../store.js', () => ({
  store: {
    dispatch: (...args) => mockDispatch(...args),
    getState: () => ({
      game_state: { board: mockBoard, status: mockStatus },
    }),
  },
  setBoard: (v) => ({ type: 'game_state/setBoard', payload: v }),
  resetBoard: () => ({ type: 'game_state/resetBoard' }),
  setScore: (v) => ({ type: 'game_state/setScore', payload: v }),
}))

import {
  reset,
  next_rot,
  board_to_block,
  block_to_board,
  add_penalty,
  board_to_spectrum,
  clear_full_rows,
  add_block_to_board,
} from './utils.js'

describe('utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPiece = 'T'
    mockRot = 0
    mockPos = 3
    mockNextPieces = []
    mockBoard = Array.from({ length: (20 + BUFFER) * WIDTH }).fill('')
    mockStatus = 'playing'
  })

  describe('board_to_block', () => {
    it('returns [0,0] for cell at piece origin', () => {
      // pos=3 means piece at row 0, col 3
      // cell at row 0, col 3 should be block [0, 0]
      const [bcol, brow] = board_to_block(3, 3, 0)
      expect(bcol).toBe(0)
      expect(brow).toBe(0)
    })

    it('returns correct offset for adjacent cell', () => {
      const [bcol, brow] = board_to_block(3, 4, 0)
      expect(bcol).toBe(1)
      expect(brow).toBe(0)
    })

    it('returns correct row offset', () => {
      // pos=3, cell at row 1, col 3
      const [bcol, brow] = board_to_block(3, 3, 1)
      expect(bcol).toBe(0)
      expect(brow).toBe(1)
    })

    it('wraps columns with modular arithmetic', () => {
      // pos=0, col=9 → block_col = (9 - 0 + 10) % 10 = 9
      const [bcol] = board_to_block(0, 9, 0)
      expect(bcol).toBe(9)
    })
  })

  describe('block_to_board', () => {
    it('returns board position from block coordinates', () => {
      // pos=3, block (0, 0) → board col 3, row 0
      const [col, row] = block_to_board(3, 0, 0)
      expect(col).toBe(3)
      expect(row).toBe(0)
    })

    it('handles column overflow wrapping', () => {
      // pos=8, block col=3 → (8+3)=11 >= WIDTH, so col wraps and row increments
      const [col, row] = block_to_board(8, 3, 0)
      expect(col).toBe(1) // (8+3) % 10 = 1
      expect(row).toBe(1) // 0 + 0 + 1 (overflow)
    })
  })

  describe('reset', () => {
    it('dispatches resetBoard and setScore(0)', () => {
      reset()
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'game_state/resetBoard' })
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'game_state/setScore', payload: 0 })
    })

    it('clears next_pieces and piece streams', () => {
      mockNextPieces = ['I', 'T']
      mockPiece = 'I'
      reset()
      expect(mockNextPieces).toEqual([])
      expect(mockPiece).toBe('')
    })
  })

  describe('next_rot', () => {
    it('returns next rotation index', () => {
      mockPiece = 'T'  // T has 4 rotations
      mockRot = 0
      expect(next_rot()).toBe(1)
    })

    it('wraps rotation back to 0', () => {
      mockPiece = 'T'  // T has 4 rotations
      mockRot = 3
      expect(next_rot()).toBe(0)
    })

    it('wraps O piece (single rotation)', () => {
      mockPiece = 'O'  // O has 1 rotation
      mockRot = 0
      expect(next_rot()).toBe(0)
    })
  })

  describe('add_penalty', () => {
    it('does nothing when rows <= 0', () => {
      add_penalty(0)
      expect(mockDispatch).not.toHaveBeenCalled()
    })

    it('does nothing when status is not PLAYING', () => {
      mockStatus = 'waiting'
      add_penalty(2)
      expect(mockDispatch).not.toHaveBeenCalled()
    })

    it('adds X rows at the bottom of the board', () => {
      add_penalty(1)
      expect(mockDispatch).toHaveBeenCalledTimes(1)
      const call = mockDispatch.mock.calls[0][0]
      expect(call.type).toBe('game_state/setBoard')
      const newBoard = call.payload
      // Last row should be all X
      for (let i = newBoard.length - WIDTH; i < newBoard.length; i++) {
        expect(newBoard[i]).toBe('X')
      }
    })
  })

  describe('board_to_spectrum', () => {
    it('returns all zeros for empty board', () => {
      const result = board_to_spectrum()
      expect(result.spectrum).toEqual(Array(10).fill(0))
      expect(result.penalty).toBe(0)
    })

    it('detects filled column heights', () => {
      // Place a block at last row, col 0
      mockBoard = Array.from({ length: (20 + BUFFER) * WIDTH }).fill('')
      mockBoard[(20 + BUFFER - 1) * WIDTH] = 'T'
      const result = board_to_spectrum()
      expect(result.spectrum[0]).toBe(1)
      expect(result.penalty).toBe(0)
    })

    it('detects penalty rows (X blocks)', () => {
      mockBoard = Array.from({ length: (20 + BUFFER) * WIDTH }).fill('')
      // Fill last row with X
      for (let i = (20 + BUFFER - 1) * WIDTH; i < (20 + BUFFER) * WIDTH; i++) {
        mockBoard[i] = 'X'
      }
      const result = board_to_spectrum()
      expect(result.penalty).toBe(1)
    })
  })

  describe('clear_full_rows', () => {
    it('returns 0 when no rows are full', () => {
      expect(clear_full_rows()).toBe(0)
    })

    it('clears a full row and returns 1', () => {
      // Fill the last row completely
      mockBoard = Array.from({ length: (20 + BUFFER) * WIDTH }).fill('')
      for (let i = (20 + BUFFER - 1) * WIDTH; i < (20 + BUFFER) * WIDTH; i++) {
        mockBoard[i] = 'T'
      }
      expect(clear_full_rows()).toBe(1)
      const call = mockDispatch.mock.calls[0][0]
      expect(call.type).toBe('game_state/setBoard')
      // The new board should have an empty first row and no full last row
      const newBoard = call.payload
      expect(newBoard.length).toBe((20 + BUFFER) * WIDTH)
    })

    it('does not clear rows with X penalty blocks', () => {
      mockBoard = Array.from({ length: (20 + BUFFER) * WIDTH }).fill('')
      for (let i = (20 + BUFFER - 1) * WIDTH; i < (20 + BUFFER) * WIDTH; i++) {
        mockBoard[i] = 'X'
      }
      expect(clear_full_rows()).toBe(0)
    })
  })

  describe('add_block_to_board', () => {
    it('places piece blocks on the board', () => {
      mockPiece = 'O'
      mockRot = 0
      mockPos = BUFFER * WIDTH + 3  // visible area, col 3
      mockBoard = Array.from({ length: (20 + BUFFER) * WIDTH }).fill('')

      add_block_to_board()
      expect(mockDispatch).toHaveBeenCalledTimes(1)
      const newBoard = mockDispatch.mock.calls[0][0].payload
      // O piece at rot 0 has 4 filled cells
      const filledCount = newBoard.filter((v) => v === 'O').length
      expect(filledCount).toBe(4)
    })
  })
})
