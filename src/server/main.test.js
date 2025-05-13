jest.mock('../../params.js', () => ({
  server: { host: 'localhost', port: 3000 },
}));

jest.mock('../../src/server/index.js', () => ({
  create: jest.fn(() => Promise.resolve()),
}));

describe('server/main.js', () => {
  it('calls server.create with params and logs message', async () => {
    const { create } = require('../../src/server/index.js');
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    // Import the module under test (this triggers its side effects)
    await import('../../src/server/main.js');

    expect(create).toHaveBeenCalledWith({ host: 'localhost', port: 3000 });
    expect(consoleLogSpy).toHaveBeenCalledWith('not yet ready to play tetris with U ...');

    consoleLogSpy.mockRestore();
  });
});
