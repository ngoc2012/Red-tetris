import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Status } from '../common/enums.js'

vi.mock('./log.js', () => ({
  loginfo: vi.fn(),
  logerror: vi.fn(),
}))

vi.mock('./Player.js', () => ({
  Player: class {
    constructor() {
      this.name = 'player'
      this.room = 'lobby'
      this.rename = vi.fn(() => true)
    }
  },
}))

vi.mock('./Room.js', () => {
  let counter = 0
  return {
    Room: class {
      constructor() {
        this.owner = 'socket-1'
        this.is_playing = false
        this.status = Status.WAITING
        this.gamemode = 'normal'
        this.players = new Map()
        this.get_info = vi.fn(() => ({ id: '0', players: [] }))
        this.start_game = vi.fn()
        this.get_score = vi.fn(() => 100)
        this.game_over = vi.fn()
        this.update_spectrum = vi.fn(() => ({ score: 50, spectrum: [], penalty: 0 }))
        this.update_score = vi.fn(() => 300)
        this.clear_rows = vi.fn()
        this.spectrums = vi.fn(() => ({}))
      }
      static count() { return (counter++).toString() }
    },
  }
})

const { mockPlayers, mockRooms } = vi.hoisted(() => ({
  mockPlayers: new Map(),
  mockRooms: new Map(),
}))

vi.mock('./game.js', () => ({
  players: mockPlayers,
  rooms: mockRooms,
  join_room: vi.fn(),
  leave_room: vi.fn(),
  give_pieces: vi.fn(),
  save_score: vi.fn(),
  game_end: vi.fn(),
}))

import { socket_init } from './socket.js'
import { Room } from './Room.js'
import { join_room, leave_room, give_pieces, save_score, game_end } from './game.js'

describe('socket_init', () => {
  let io, socket, connectionHandler
  const socketListeners = {}

  beforeEach(() => {
    vi.clearAllMocks()
    mockPlayers.clear()
    mockRooms.clear()
    Object.keys(socketListeners).forEach((k) => delete socketListeners[k])

    socket = {
      id: 'socket-1',
      emit: vi.fn(),
      join: vi.fn(),
      on: vi.fn((event, cb) => { socketListeners[event] = cb }),
      to: vi.fn(() => ({ emit: vi.fn() })),
    }

    io = {
      on: vi.fn((event, cb) => {
        if (event === 'connection') connectionHandler = cb
      }),
      to: vi.fn(() => ({ emit: vi.fn() })),
    }

    socket_init(io)
    connectionHandler(socket)
  })

  it('registers connection handler on io', () => {
    expect(io.on).toHaveBeenCalledWith('connection', expect.any(Function))
  })

  it('emits connected with socket id', () => {
    expect(socket.emit).toHaveBeenCalledWith('connected', { id: 'socket-1' })
  })

  it('joins lobby on connection', () => {
    expect(socket.join).toHaveBeenCalledWith('lobby')
  })

  it('creates a Player on connection', () => {
    expect(mockPlayers.has('socket-1')).toBe(true)
  })

  describe('rename', () => {
    it('calls player.rename and returns success', () => {
      const callback = vi.fn()
      socketListeners['rename']({ new_name: 'Bob' }, callback)
      expect(callback).toHaveBeenCalledWith({ success: true })
    })
  })

  describe('new_room', () => {
    it('creates a room and returns room_id', () => {
      const callback = vi.fn()
      socketListeners['new_room'](callback)
      expect(callback).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
      expect(io.to).toHaveBeenCalledWith('lobby')
    })
  })

  describe('join_room', () => {
    it('fails if room does not exist', () => {
      const callback = vi.fn()
      socketListeners['join_room'](99, callback)
      expect(callback).toHaveBeenCalledWith({ success: false })
    })

    it('fails if room is playing', () => {
      mockRooms.set(0, { status: Status.PLAYING, get_info: vi.fn() })
      const callback = vi.fn()
      socketListeners['join_room'](0, callback)
      expect(callback).toHaveBeenCalledWith({ success: false })
    })

    it('succeeds if room exists and is waiting', () => {
      const roomInfo = { id: '0', players: [] }
      mockRooms.set(0, { status: Status.WAITING, get_info: vi.fn(() => roomInfo) })
      const callback = vi.fn()
      socketListeners['join_room'](0, callback)
      expect(join_room).toHaveBeenCalledWith(socket, 0)
      expect(callback).toHaveBeenCalledWith({ success: true, room: roomInfo })
    })
  })

  describe('leave_room', () => {
    it('calls leave_room and resets player to lobby', () => {
      mockPlayers.set('socket-1', { name: 'player', room: 0 })
      mockRooms.set(0, {})
      socketListeners['leave_room'](0)
      expect(leave_room).toHaveBeenCalledWith(io, socket, 0)
      expect(mockPlayers.get('socket-1').room).toBe('lobby')
      expect(socket.join).toHaveBeenCalledWith('lobby')
    })

    it('does nothing if room_id is negative', () => {
      socketListeners['leave_room'](-1)
      expect(leave_room).not.toHaveBeenCalled()
    })
  })

  describe('room_list', () => {
    it('returns list of rooms with id and status', () => {
      mockRooms.set(0, { status: 'waiting' })
      mockRooms.set(1, { status: 'playing' })
      const callback = vi.fn()
      socketListeners['room_list'](callback)
      expect(callback).toHaveBeenCalledWith([
        { id: 0, status: 'waiting' },
        { id: 1, status: 'playing' },
      ])
    })
  })

  describe('game_start', () => {
    it('starts game if socket is owner', () => {
      const room = new Room()
      mockRooms.set(0, room)
      const callback = vi.fn()
      socketListeners['game_start'](0, callback)
      expect(room.start_game).toHaveBeenCalled()
      expect(give_pieces).toHaveBeenCalledWith(io, 0, 4)
      expect(callback).toHaveBeenCalledWith({ success: true })
    })

    it('fails if socket is not owner', () => {
      const room = new Room()
      room.owner = 'other-socket'
      mockRooms.set(0, room)
      const callback = vi.fn()
      socketListeners['game_start'](0, callback)
      expect(callback).toHaveBeenCalledWith({ success: false })
    })
  })

  describe('gamemode', () => {
    it('sets gamemode if socket is owner', () => {
      const room = new Room()
      mockRooms.set(0, room)
      socketListeners['gamemode']('invis', 0)
      expect(room.gamemode).toBe('invis')
    })

    it('does not set gamemode if socket is not owner', () => {
      const room = new Room()
      room.owner = 'other-socket'
      mockRooms.set(0, room)
      socketListeners['gamemode']('invis', 0)
      expect(room.gamemode).not.toBe('invis')
    })
  })

  describe('spectrums', () => {
    it('returns null if player not found', () => {
      mockPlayers.clear()
      const callback = vi.fn()
      socketListeners['spectrums'](callback)
      expect(callback).toHaveBeenCalledWith(null)
    })

    it('returns null if room_id is negative', () => {
      mockPlayers.set('socket-1', { room: -1 })
      const callback = vi.fn()
      socketListeners['spectrums'](callback)
      expect(callback).toHaveBeenCalledWith(null)
    })

    it('returns spectrums for valid room', () => {
      const room = new Room()
      room.players = new Map([['socket-1', {}], ['socket-2', {}]])
      mockPlayers.set('socket-1', { room: 0 })
      mockRooms.set(0, room)
      const callback = vi.fn()
      socketListeners['spectrums'](callback)
      expect(room.spectrums).toHaveBeenCalledWith('socket-1')
    })
  })

  describe('board_update', () => {
    it('updates spectrum and emits to room', () => {
      const room = new Room()
      mockPlayers.set('socket-1', { name: 'Alice', room: 0 })
      mockRooms.set(0, room)
      socketListeners['board_update']({ spectrum: [1, 2], penalty: 1 })
      expect(room.update_spectrum).toHaveBeenCalledWith('socket-1', [1, 2], 1)
    })

    it('returns early if room not found', () => {
      mockPlayers.set('socket-1', { room: 99 })
      socketListeners['board_update']({ spectrum: [], penalty: 0 })
    })
  })

  describe('game_over', () => {
    it('calls room.game_over and game_end', () => {
      const room = new Room()
      mockRooms.set(0, room)
      socketListeners['game_over'](0)
      expect(room.game_over).toHaveBeenCalledWith('socket-1')
      expect(game_end).toHaveBeenCalledWith(io, 0)
      expect(save_score).toHaveBeenCalledWith('socket-1', 100, 0, 'game_over')
    })

    it('returns early if room not found', () => {
      socketListeners['game_over'](999)
      expect(game_end).not.toHaveBeenCalled()
    })
  })

  describe('cleared_a_line', () => {
    it('updates score and emits score_update', () => {
      const room = new Room()
      mockPlayers.set('socket-1', { name: 'Alice', room: 0 })
      mockRooms.set(0, room)
      socketListeners['cleared_a_line'](1)
      expect(room.update_score).toHaveBeenCalledWith('socket-1', 100)
      expect(room.clear_rows).toHaveBeenCalledWith(1)
    })

    it('emits penalty for multi-row clears', () => {
      const room = new Room()
      mockPlayers.set('socket-1', { name: 'Alice', room: 0 })
      mockRooms.set(0, room)
      socketListeners['cleared_a_line'](3)
      // 200*3 - 100 + 0 = 500
      expect(room.update_score).toHaveBeenCalledWith('socket-1', 500)
    })

    it('calculates tetris bonus correctly', () => {
      const room = new Room()
      mockPlayers.set('socket-1', { name: 'Alice', room: 0 })
      mockRooms.set(0, room)
      socketListeners['cleared_a_line'](4)
      // 200*4 - 100 + 100 = 800
      expect(room.update_score).toHaveBeenCalledWith('socket-1', 800)
    })
  })

  describe('next_piece', () => {
    it('gives pieces for the player room', () => {
      mockPlayers.set('socket-1', { room: 1 })
      socketListeners['next_piece']()
      expect(give_pieces).toHaveBeenCalledWith(io, 1, 1)
    })

    it('returns early if no room', () => {
      mockPlayers.set('socket-1', { room: undefined })
      socketListeners['next_piece']()
      expect(give_pieces).not.toHaveBeenCalled()
    })
  })

  describe('disconnecting', () => {
    it('leaves room if player is in one', () => {
      mockPlayers.set('socket-1', { room: 5 })
      mockRooms.set(5, {})
      socketListeners['disconnecting']()
      expect(leave_room).toHaveBeenCalledWith(io, socket, 5)
    })
  })

  describe('disconnect', () => {
    it('removes player from players map', () => {
      mockPlayers.set('socket-1', { name: 'player' })
      socketListeners['disconnect']()
      expect(mockPlayers.has('socket-1')).toBe(false)
    })
  })
})
