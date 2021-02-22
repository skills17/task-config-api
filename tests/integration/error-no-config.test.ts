import path from 'path';
import Server from '../../src/Server';

describe('error no config', () => {
  let server: Server;

  afterEach(async () => {
    if (server) {
      await server.stop();
    }
  });

  it('prints an error if the config file does not exist', async () => {
    const printer = {
      log: jest.fn(),
      error: jest.fn(),
    };

    server = new Server(4500, '127.0.0.1', [path.resolve(__dirname, 'tasks')], printer);
    await server.serve(true);

    expect(printer.log).not.toHaveBeenCalled();
    expect(printer.error).toHaveBeenCalledTimes(2);
    expect(printer.error).toHaveBeenCalledWith(
      `Error: Could not load task ${path.resolve(__dirname, 'tasks')}: config.json does not exist`,
    );
    expect(printer.error).toHaveBeenCalledWith('Error: No task can be served');
  });
});
