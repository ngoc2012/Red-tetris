import { describe, it, expect } from 'vitest'
import { BUFFER, LENGTH, WIDTH } from '../common/constants.js'
import { Mode, Gamemode } from '../common/enums.js'
import {
  store,
  setStatus, setMode, setGamemode, setLevel,
  setRoomId, setBoard, setScore, resetBoard,
  setId, setName,
} from './store.js'

describe('store', () => {
  describe('initial state', () => {
    it('has correct player initial state', () => {
      const state = store.getState()
      expect(state.player.id).toBe('')
      expect(state.player.name).toBe('player')
    })

    it('has correct game_state initial state', () => {
      const state = store.getState()
      expect(state.game_state.room_id).toBe(-1)
      expect(state.game_state.status).toBe('waiting')
      expect(state.game_state.mode).toBe(Mode.SINGLE)
      expect(state.game_state.gamemode).toBe(Gamemode.NORMAL)
      expect(state.game_state.level).toBe(0)
      expect(state.game_state.score).toBe(0)
      expect(state.game_state.board.length).toBe((LENGTH + BUFFER) * WIDTH)
    })
  })

  describe('game_state reducers', () => {
    it('setStatus updates status', () => {
      store.dispatch(setStatus('playing'))
      expect(store.getState().game_state.status).toBe('playing')
      store.dispatch(setStatus('waiting'))
    })

    it('setMode updates mode', () => {
      store.dispatch(setMode(Mode.MULTI))
      expect(store.getState().game_state.mode).toBe(Mode.MULTI)
      store.dispatch(setMode(Mode.SINGLE))
    })

    it('setGamemode updates gamemode', () => {
      store.dispatch(setGamemode(Gamemode.INVIS))
      expect(store.getState().game_state.gamemode).toBe(Gamemode.INVIS)
      store.dispatch(setGamemode(Gamemode.NORMAL))
    })

    it('setLevel updates level', () => {
      store.dispatch(setLevel(5))
      expect(store.getState().game_state.level).toBe(5)
      store.dispatch(setLevel(0))
    })

    it('setScore updates score', () => {
      store.dispatch(setScore(999))
      expect(store.getState().game_state.score).toBe(999)
      store.dispatch(setScore(0))
    })

    it('setRoomId updates room_id', () => {
      store.dispatch(setRoomId(7))
      expect(store.getState().game_state.room_id).toBe(7)
      store.dispatch(setRoomId(-1))
    })

    it('setBoard updates board', () => {
      const newBoard = Array.from({ length: (LENGTH + BUFFER) * WIDTH }).fill('T')
      store.dispatch(setBoard(newBoard))
      expect(store.getState().game_state.board[0]).toBe('T')
      store.dispatch(resetBoard())
    })

    it('resetBoard resets board to empty', () => {
      const newBoard = Array.from({ length: (LENGTH + BUFFER) * WIDTH }).fill('T')
      store.dispatch(setBoard(newBoard))
      store.dispatch(resetBoard())
      expect(store.getState().game_state.board.every((v) => v === '')).toBe(true)
    })
  })

  describe('player reducers', () => {
    it('setId updates player id', () => {
      store.dispatch(setId('socket-123'))
      expect(store.getState().player.id).toBe('socket-123')
      store.dispatch(setId(''))
    })

    it('setName updates player name', () => {
      store.dispatch(setName('Alice'))
      expect(store.getState().player.name).toBe('Alice')
      store.dispatch(setName('player'))
    })
  })
})
