import path from 'path';
import ip from 'ip';
import fetch from 'node-fetch';
import Server from '../../src/Server';

describe('binds on other port', () => {
  const ipAddress = ip.address();
  let server: Server;

  afterEach(async () => {
    if (server) {
      await server.stop();
    }
  });

  it('serves the files on a different port', async () => {
    const printer = {
      log: jest.fn(),
      error: jest.fn(),
    };

    server = new Server(
      3123,
      '127.0.0.1',
      [path.resolve(__dirname, 'tasks', 'test-task1')],
      printer,
    );
    await server.serve(true);

    expect(printer.log).toHaveBeenCalledTimes(2);
    expect(printer.error).not.toHaveBeenCalled();
    expect(printer.log).toHaveBeenCalledWith('test-task1 loaded');
    expect(printer.log).toHaveBeenCalledWith('\nAPI available at http://localhost:3123');
    expect(server.getHost()).toEqual('http://localhost:3123');

    const config = await (await fetch('http://localhost:3123/test-task1/config.json')).json();

    expect(config).toStrictEqual({ id: 'test-task1', localHistory: true });
    expect(ipAddress).not.toEqual('127.0.0.1');
    await expect(async () =>
      fetch(`http://${ipAddress}:3123/test-task1/config.json`),
    ).rejects.toThrowError('ECONNREFUSED');
  });
});
