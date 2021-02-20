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

    expect(printer.log).toHaveBeenCalledTimes(1);
    expect(printer.error).toHaveBeenCalledTimes(1);
    expect(printer.error).toHaveBeenCalledWith(
      `Error: Could not load task ${path.resolve(__dirname, 'tasks')}: config.json does not exist`,
    );
    expect(printer.log).toHaveBeenCalledWith('\nAPI available at http://localhost:4500');
  });
});
