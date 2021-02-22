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

    expect(printer.log).not.toHaveBeenCalled();
    expect(printer.error).toHaveBeenCalledTimes(2);
    expect(printer.error).toHaveBeenCalledWith(
      `Error: Could not load task ${path.resolve(
        __dirname,
        'tasks',
        'test-task3',
      )}: no task id set`,
    );
    expect(printer.error).toHaveBeenCalledWith('Error: No task can be served');
  });
});
