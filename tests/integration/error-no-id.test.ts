import path from 'path';
import Server from '../../src/Server';

describe('error no id', () => {
  let server: Server;

  afterEach(async () => {
    if (server) {
      await server.stop();
    }
  });

  it('prints an error if the config file does not have a task id', async () => {
    const printer = {
      log: jest.fn(),
      error: jest.fn(),
    };

    server = new Server(
      4500,
      '127.0.0.1',
      [path.resolve(__dirname, 'tasks', 'test-task3')],
      printer,
    );
    await server.serve(true);

    expect(printer.log).toHaveBeenCalledTimes(1);
    expect(printer.error).toHaveBeenCalledTimes(1);
    expect(printer.error).toHaveBeenCalledWith(
      `Error: Could not load task ${path.resolve(
        __dirname,
        'tasks',
        'test-task3',
      )}: no task id set`,
    );
    expect(printer.log).toHaveBeenCalledWith('\nAPI available at http://localhost:4500');
  });
});
