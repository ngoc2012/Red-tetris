import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'fs'

vi.mock('fs', () => {
  const existsSync = vi.fn()
  const readFileSync = vi.fn()
  const writeFileSync = vi.fn()
  return { default: { existsSync, readFileSync, writeFileSync }, existsSync, readFileSync, writeFileSync }
})
vi.mock('./log.js', () => ({
  loginfo: vi.fn(),
  logerror: vi.fn(),
}))
vi.mock('./Piece.js', () => ({
  Piece: class { constructor() { this.type = 'T' } },
}))

import { players, rooms, join_room, leave_room, give_pieces, save_score, game_end } from './game.js'

describe('game', () => {
  let io, socket

  beforeEach(() => {
    vi.clearAllMocks()
    players.clear()
    rooms.clear()
    io = {
      to: vi.fn(() => io),
      emit: vi.fn(),
    }
    socket = {
      id: 'socket-1',
      join: vi.fn(),
      leave: vi.fn(),
      to: vi.fn(() => ({ emit: vi.fn() })),
    }
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('join_room', () => {
    it('moves socket from lobby to room', () => {
      const mockRoom = {
        add_player: vi.fn(),
      }
      rooms.set(0, mockRoom)
      players.set('socket-1', { name: 'Alice', room: 'lobby' })

      join_room(socket, 0)

      expect(socket.leave).toHaveBeenCalledWith('lobby')
      expect(socket.join).toHaveBeenCalledWith(0)
      expect(mockRoom.add_player).toHaveBeenCalledWith('socket-1', 'Alice')
      expect(players.get('socket-1').room).toBe(0)
    })
  })

  describe('leave_room', () => {
    it('returns early if room_id is negative', () => {
      leave_room(io, socket, -1)
      expect(socket.leave).not.toHaveBeenCalled()
    })

    it('returns early if room does not exist', () => {
      leave_room(io, socket, 999)
      expect(socket.leave).not.toHaveBeenCalled()
    })

    it('removes player from room and checks game end', () => {
      const mockRoom = {
        remove_player: vi.fn(),
        players: new Map([['socket-1', {}], ['socket-2', {}]]),
        is_playing: false,
        status: 'waiting',
      }
      rooms.set(0, mockRoom)

      leave_room(io, socket, 0)

      expect(socket.leave).toHaveBeenCalledWith(0)
      expect(mockRoom.remove_player).toHaveBeenCalledWith('socket-1')
    })

    it('schedules room deletion when last player leaves', () => {
      vi.useFakeTimers()
      const mockRoom = {
        remove_player: vi.fn(),
        players: new Map(),
        is_playing: false,
        status: 'waiting',
        deleteTimeout: null,
      }
      rooms.set(0, mockRoom)

      leave_room(io, socket, 0)

      expect(mockRoom.deleteTimeout).not.toBeNull()

      vi.advanceTimersByTime(200)
      expect(rooms.has(0)).toBe(false)
    })
  })

  describe('give_pieces', () => {
    it('emits next_piece for each requested piece', () => {
      give_pieces(io, 'room-1', 3)

      expect(io.to).toHaveBeenCalledWith('room-1')
      expect(io.emit).toHaveBeenCalledTimes(3)
      expect(io.emit).toHaveBeenCalledWith('next_piece', 'T')
    })
  })

  describe('save_score', () => {
    it('does nothing if score is 0', () => {
      save_score('socket-1', 0, 0, 'game_over')
      expect(fs.writeFileSync).not.toHaveBeenCalled()
    })

    it('creates new history file if none exists', () => {
      players.set('socket-1', { name: 'Alice' })
      fs.existsSync.mockReturnValue(false)

      save_score('socket-1', 100, 0, 'game_over')

      expect(fs.writeFileSync).toHaveBeenCalled()
      const written = JSON.parse(fs.writeFileSync.mock.calls[0][1])
      expect(written).toHaveLength(1)
      expect(written[0].name).toBe('Alice')
      expect(written[0].score).toBe(100)
      expect(written[0].result).toBe('game_over')
    })

    it('appends to existing history file', () => {
      players.set('socket-1', { name: 'Bob' })
      fs.existsSync.mockReturnValue(true)
      fs.readFileSync.mockReturnValue(JSON.stringify([{ name: 'Old', score: 50 }]))

      save_score('socket-1', 200, 1, 'game_win')

      const written = JSON.parse(fs.writeFileSync.mock.calls[0][1])
      expect(written).toHaveLength(2)
      expect(written[1].name).toBe('Bob')
      expect(written[1].score).toBe(200)
    })
  })

  describe('game_end', () => {
    it('does nothing if room does not exist', () => {
      game_end(io, 999)
      expect(io.to).not.toHaveBeenCalled()
    })

    it('does nothing if room is not playing', () => {
      rooms.set(0, { is_playing: false })
      game_end(io, 0)
      expect(io.to).not.toHaveBeenCalled()
    })

    it('does nothing if more than 1 player left', () => {
      rooms.set(0, {
        is_playing: true,
        players_left: new Map([['s1', {}], ['s2', {}]]),
      })
      game_end(io, 0)
      expect(io.emit).not.toHaveBeenCalled()
    })

    it('ends game and emits game_win to last player', () => {
      players.set('winner', { name: 'Winner' })
      fs.existsSync.mockReturnValue(false)
      const mockRoom = {
        is_playing: true,
        players_left: new Map([['winner', { playing: true }]]),
        get_score: vi.fn(() => 500),
        end_game: vi.fn(),
      }
      rooms.set(0, mockRoom)

      game_end(io, 0)

      expect(io.to).toHaveBeenCalledWith('winner')
      expect(io.emit).toHaveBeenCalledWith('game_win')
      expect(mockRoom.end_game).toHaveBeenCalled()
    })

    it('ends game when 0 players left', () => {
      const mockRoom = {
        is_playing: true,
        players_left: new Map(),
        end_game: vi.fn(),
      }
      rooms.set(0, mockRoom)

      game_end(io, 0)

      expect(mockRoom.end_game).toHaveBeenCalled()
    })
  })
})
