import { expect } from 'chai';
import { Room } from '../../src/server/Room.js';

// Mock loginfo to silence logs during testing
// import * as logModule from '../../src/server/index.js';
// logModule.loginfo = () => {};

describe('Room', () => {
  let room;

  beforeEach(() => {
    const mockIO = {}; // mock socket.io instance
    room = new Room(mockIO, 'owner1');
  });

  it('should create a room with the owner', () => {
    expect(room.owner).to.equal('owner1');
    expect(room.id).to.be.a('string');
    expect(room.status).to.equal('WAITING');
  });

  it('should add a player', () => {
    room.add_player('player1', 'Alice');
    expect(room.players.has('player1')).to.be.true;
    expect(room.players.get('player1').name).to.equal('Alice');
  });

  it('should remove a player and transfer ownership if owner leaves', () => {
    room.add_player('player1', 'Alice');
    room.remove_player('owner1');
    expect(room.owner).to.equal('player1');
  });

  it('should start a game and set all players to playing', () => {
    room.add_player('player1', 'Alice');
    room.start_game();
    expect(room.status).to.equal('PLAYING');
    expect([...room.players.values()].every(p => p.playing)).to.be.true;
  });

  it('should update score correctly', () => {
    room.add_player('player1', 'Alice');
    room.start_game();
    const newScore = room.update_score('player1', 100);
    expect(newScore).to.equal(100);
  });

  it('should return correct spectrum data', () => {
    room.add_player('p1', 'Alice');
    room.add_player('p2', 'Bob');
    room.update_spectrum('p1', [1, 2, 3], 1);
    const spectrums = room.spectrums('p2');
    expect(spectrums).to.have.property('p1');
    expect(spectrums.p1.spec).to.deep.equal([1, 2, 3]);
  });
});
