import path from 'path';
import fs from 'fs';
import http from 'http';
import express, { Request, Response } from 'express';
import uniqid from 'uniqid';
import TaskConfig from '@skills17/task-config';

export default class Server {
  private server?: http.Server;

  private configs: Record<string, TaskConfig> = {};

  constructor(
    private port: number,
    private bind: string,
    taskPaths: string[],
    private printer: { log: (...args: any) => void; error: (...args: any) => void } = console, // eslint-disable-line
  ) {
    taskPaths.forEach((taskPath) => {
      const configPath = path.resolve(taskPath, 'config.json');

      if (!fs.existsSync(configPath)) {
        this.printer.error(`Error: Could not load task ${taskPath}: config.json does not exist`);
        return;
      }

      const config = new TaskConfig();
      config.loadFromFileSync(path.resolve(taskPath, 'config.json'));

      const taskId = config.getId();

      if (!taskId) {
        this.printer.error(`Error: Could not load task ${taskPath}: no task id set`);
      } else {
        this.configs[taskId] = config;
        this.printer.log(`${taskId} loaded`);
      }
    });
  }

  /**
   * Handles CORS by adding the correct headers to the response.
   *
   * @param req Request object
   * @param res Response object
   * @param next Next middleware
   */
  private handleCors(req: Request, res: Response, next: () => void): void {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') {
      res.sendStatus(200).end();
    } else {
      next();
    }
  }

  /**
   * Save an entry to the local task history.
   *
   * @param req Request object
   * @param res Response object
   */
  private postHistory(req: Request, res: Response): void {
    if (!this.configs[req.params.taskId]) {
      res.status(404).send('Task does not exist').end();
      return;
    }

    const config = this.configs[req.params.taskId];

    if (!config.isLocalHistoryEnabled()) {
      res.json({ created: false }).end();
      return;
    }

    const historyDir = path.resolve(config.getProjectRoot(), '.history');
    const historyFile = path.resolve(historyDir, `${uniqid()}.json`);

    // create history dir if it doesn't exist
    if (!fs.existsSync(historyDir)) {
      fs.mkdirSync(historyDir);
    }

    // write history file
    fs.writeFileSync(
      historyFile,
      JSON.stringify({ time: Math.round(new Date().getTime() / 1000), ...req.body }, undefined, 2),
    );

    res.json({ created: true }).end();
  }

  /**
   * Checks whether the server is bound to localhost only
   */
  private isLocalhost(): boolean {
    return !this.bind || this.bind === '127.0.0.1' || this.bind === '0.0.0.0';
  }

  /**
   * Returns the host under which the server is available
   */
  public getHost(): string {
    return `http://${this.isLocalhost() ? 'localhost' : this.bind}:${this.port}`;
  }

  /**
   * Starts serving static task files
   *
   * @param printOnReady Print to the console on which address the files are served
   */
  public async serve(printOnReady = true): Promise<void> {
    return new Promise((resolve) => {
      const app = express();

      // configure express
      app.use(this.handleCors);
      app.use(express.json());

      // create routes
      app.post('/:taskId/history', this.postHistory.bind(this));
      Object.values(this.configs).forEach((config) => {
        const taskId = config.getId()?.replace(/\s/g, '-').toLowerCase();
        app.use(
          `/${taskId}/config.json`,
          express.static(path.resolve(config.getProjectRoot(), 'config.json')),
        );
      });

      // handle listening callback
      const onListen = () => {
        if (printOnReady) {
          this.printer.log(`\nAPI available at ${this.getHost()}`);
        }

        resolve();
      };

      // start listening
      if (this.bind) {
        this.server = app.listen(this.port, this.bind, onListen);
      } else {
        this.server = app.listen(this.port, onListen);
      }
    });
  }

  /**
   * Stops serving files
   */
  public async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}
