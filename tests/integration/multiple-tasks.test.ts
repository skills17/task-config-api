import path from 'path';
import fetch from 'node-fetch';
import Server from '../../src/Server';

describe('multiple tasks', () => {
  let server: Server;

  afterEach(async () => {
    if (server) {
      await server.stop();
    }
  });

  it('serves multiple tasks', async () => {
    const printer = {
      log: jest.fn(),
      error: jest.fn(),
    };

    server = new Server(
      4500,
      '127.0.0.1',
      [
        path.resolve(__dirname, 'tasks', 'test-task1'),
        path.resolve(__dirname, 'tasks', 'test-task2'),
      ],
      printer,
    );
    await server.serve(true);

    expect(printer.log).toHaveBeenCalledTimes(3);
    expect(printer.error).not.toHaveBeenCalled();
    expect(printer.log).toHaveBeenCalledWith('test-task1 loaded');
    expect(printer.log).toHaveBeenCalledWith('test-task2 loaded');
    expect(printer.log).toHaveBeenCalledWith('\nAPI available at http://localhost:4500');
    expect(server.getHost()).toEqual('http://localhost:4500');

    const config1 = await (await fetch('http://localhost:4500/test-task1/config.json')).json();
    const config2 = await (await fetch('http://localhost:4500/test-task2/config.json')).json();

    expect(config1).toStrictEqual({ id: 'test-task1', localHistory: true });
    expect(config2).toStrictEqual({ id: 'test-task2', localHistory: false });
  });
});
