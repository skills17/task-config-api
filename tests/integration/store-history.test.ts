import path from 'path';
import fs from 'fs';
import fetch from 'node-fetch';
import rimraf from 'rimraf';
import Server from '../../src/Server';

describe('multiple tasks', () => {
  const historyDirs = [
    path.resolve(__dirname, 'tasks', 'test-task1', '.history'),
    path.resolve(__dirname, 'tasks', 'test-task2', '.history'),
  ];
  let server: Server;

  beforeAll(async () => {
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

    historyDirs.forEach((historyDir) => {
      if (fs.existsSync(historyDir)) {
        rimraf.sync(historyDir);
      }
    });
  });

  afterAll(async () => {
    if (server) {
      await server.stop();
    }
  });

  it('stores an entry if history is enabled', async () => {
    expect(fs.existsSync(historyDirs[0])).toEqual(false);

    const result = (await (
      await fetch('http://localhost:4500/test-task1/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testResults: ['test'] }),
      })
    ).json()) as { created: boolean };

    expect(result.created).toEqual(true);
    expect(fs.existsSync(historyDirs[0])).toEqual(true);
    const files = fs.readdirSync(historyDirs[0]);
    expect(files).toHaveLength(1);

    const history = JSON.parse(fs.readFileSync(path.resolve(historyDirs[0], files[0])).toString());
    expect(typeof history.time).toEqual('number');
    expect(history.testResults).toStrictEqual(['test']);
  });

  it('does not store an entry if history is disabled', async () => {
    expect(fs.existsSync(historyDirs[1])).toEqual(false);

    const result = (await (
      await fetch('http://localhost:4500/test-task2/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testResults: ['test'] }),
      })
    ).json()) as { created: boolean };

    expect(result.created).toEqual(false);
    expect(fs.existsSync(historyDirs[1])).toEqual(false);
  });
});
