import path from 'path';
import ip from 'ip';
import fetch from 'node-fetch';
import Server from '../../src/Server';

describe('binds on other ip', () => {
  const ipAddress = ip.address();
  let server: Server;

  afterEach(async () => {
    if (server) {
      await server.stop();
    }
  });

  it('is only reachable from the defined ip', async () => {
    const printer = {
      log: jest.fn(),
      error: jest.fn(),
    };

    expect(ipAddress).not.toEqual('127.0.0.1');

    server = new Server(4500, ipAddress, [path.resolve(__dirname, 'tasks', 'test-task1')], printer);
    await server.serve(true);

    expect(printer.log).toHaveBeenCalledTimes(2);
    expect(printer.error).not.toHaveBeenCalled();
    expect(printer.log).toHaveBeenCalledWith('test-task1 loaded');
    expect(printer.log).toHaveBeenCalledWith(`\nAPI available at http://${ipAddress}:4500`);
    expect(server.getHost()).toEqual(`http://${ipAddress}:4500`);

    const ipConfig = await (await fetch(`http://${ipAddress}:4500/test-task1/config.json`)).json();

    expect(ipConfig).toStrictEqual({ id: 'test-task1', localHistory: true });
    await expect(async () =>
      fetch('http://localhost:4500/test-task1/config.json'),
    ).rejects.toThrowError('ECONNREFUSED');
    await expect(async () =>
      fetch('http://127.0.0.1:4500/test-task1/config.json'),
    ).rejects.toThrowError('ECONNREFUSED');
  });
});
