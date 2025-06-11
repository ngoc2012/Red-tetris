import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Lobby } from './Lobby';
import { useSelector, useDispatch } from 'react-redux';
import socket from '../socket';

// Mock the external modules
jest.mock('react-redux');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
  Link: jest.fn(({ children, to, onClick }) => (
    <a href={to} onClick={onClick}>
      {children}
    </a>
  )),
}));

jest.mock('../socket', () => {
  const mockSocket = {
    on: jest.fn(),
    emit: jest.fn((event, ...args) => {
      const callback = args[args.length - 1];
      if (event === 'room_list') {
        callback([{ id: 'room1', status: 'waiting' }]);
      } else if (event === 'rename') {
        const { new_name } = args[0];
        if (new_name === 'Invalid Name') {
          callback({ success: false });
        } else {
          callback({ success: true });
        }
      } else if (event === 'new_room') {
        callback({ success: true, room_id: 'new_room_id' });
      }
    }),
    off: jest.fn(),
  };
  return mockSocket;
});

describe('Lobby Component', () => {
  const mockDispatch = jest.fn();
  const mockNavigate = jest.fn();
  const { useNavigate } = require('react-router-dom');

  beforeEach(() => {
    useDispatch.mockReturnValue(mockDispatch);
    useNavigate.mockReturnValue(mockNavigate);
    useSelector.mockReturnValue('Test User');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the lobby with the user name', () => {
    render(<Lobby />);
    expect(screen.getByText(/Hi Test User!/i)).toBeInTheDocument();
  });

  it('allows the user to edit their name', () => {
    render(<Lobby />);
    const nameElement = screen.getByText(/Hi Test User!/i);
    fireEvent.click(nameElement);

    const inputElement = screen.getByDisplayValue('Test User');
    fireEvent.change(inputElement, { target: { value: 'New Name' } });
    fireEvent.blur(inputElement);

    expect(socket.emit).toHaveBeenCalledWith(
      'rename',
      { new_name: 'New Name' },
      expect.any(Function)
    );
  });

  it('handles rename failure', () => {
    render(<Lobby />);
    const nameElement = screen.getByText(/Hi Test User!/i);
    fireEvent.click(nameElement);

    const inputElement = screen.getByDisplayValue('Test User');
    fireEvent.change(inputElement, { target: { value: 'Invalid Name' } });
    fireEvent.blur(inputElement);

    expect(screen.getByText('Invalid name')).toBeInTheDocument();
  });

  it('navigates to a new room when "New room" button is clicked', () => {
    render(<Lobby />);
    const newRoomButton = screen.getByText(/New room/i);
    fireEvent.click(newRoomButton);

    expect(socket.emit).toHaveBeenCalledWith('new_room', expect.any(Function));
    expect(mockNavigate).toHaveBeenCalledWith('new_room_id/Test User');
  });

  it('navigates to history page when "History" button is clicked', () => {
    render(<Lobby />);
    const historyButton = screen.getByText(/History/i);
    fireEvent.click(historyButton);

    expect(mockNavigate).toHaveBeenCalledWith('/history');
  });

  it('displays rooms with correct status', () => {
    render(<Lobby />);
    expect(screen.getByText('room1')).toBeInTheDocument();
  });

  it('handles escape key press during name edit', () => {
    render(<Lobby />);
    const nameElement = screen.getByText(/Hi Test User!/i);
    fireEvent.click(nameElement);

    const inputElement = screen.getByDisplayValue('Test User');
    fireEvent.keyDown(inputElement, { key: 'Escape' });

    expect(inputElement.value).toBe('Test User');
  });
});
