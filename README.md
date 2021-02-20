# skills17/task-config-api

This package provides an API for the task config and local history for environments where filesystem
access is not possible, such as within a browser.

## Table of contents

- [Installation](#installation)
  - [Production environment](#production-environment)
- [Usage](#usage)
  - [CLI](#cli)
  - [API Endpoints](#api-endpoints)
- [License](#license)

## Installation

For local development, simply run the following command in the task directory:
```bash
npx @skills17/task-config-api
```

The API will then serve the task from the current directory at `http://localhost:4500/:taskId` where
`taskId` is the `id` field from the `config.json` file.

### Production environment

For the production competition environment, it is suggested to install this package once globally
and let one instance handle all tasks. This is more performant than running separate instances for
multiple tasks.

To do so, install this package globally:
```bash
npm install -g @skills17/task-config-api
```

After that, run the globally installed `skills17-task-config-api` command and specify the directories
of all tasks that should be served.
```bash
skills17-task-config-api /path/to/task1 /path/to/task2 /path/to/task3 ...
```

## Usage

### CLI

```
  Usage
    $ skills17-task-config-api [options] [task directories...]

    If no task directory is specified, the current directory will be used.

  Options
    --port, -p   Specify the port [Default=4500]
    --bind, -b   Specify where the server will be bound [Default=127.0.0.1]
```

### API Endpoints

The following API endpoints will be available. The `taskId` parameter is the `id` field from the
`config.json` file of the targeted task.

#### `GET /:taskId/config.json`

Returns the `config.json` file of the path.
It has not been processed and is exactly the version present in the filesystem.

This can later be passed to a `@skills17/task-cconfig` instance in the `load(config)` method.

#### `POST /:taskId/history`

Will create a new entry in the local history if that feature is available.
If the feature is disabled, the response will be `{"created": false}`, otherwise true will be
returned after a successful entry.

The request needs to have a `application/json` content type and the body will be stored in the
history file.
Additionally, a `time` field will be added to the body before saving the file.
For example, if the body is `{"testResults":[...]}`, it will be saved as
`{"time":1613859061,"testResults":[...]}`.

## License

[MIT](https://github.com/skills17/task-config-api/blob/master/LICENSE)
