# jest-shell-matchers

> Test shell scripts while mocking specific commands

Run shell scripts and make assertions about the exit code, stdout, stderr, and termination signal that are generated. It uses the [spawn-with-mocks](https://www.npmjs.com/package/spawn-with-mocks) library, so if needed you can write mocks for specific shell commands.

[![Build Status](https://travis-ci.org/raingerber/jest-shell-matchers.svg?branch=master)](https://travis-ci.org/raingerber/jest-shell-matchers) [![codecov](https://codecov.io/gh/raingerber/jest-shell-matchers/branch/master/graph/badge.svg)](https://codecov.io/gh/raingerber/jest-shell-matchers)

## Usage

The library exposes [asynchronous matchers](https://jestjs.io/docs/en/expect#async-matchers), so it requires [Jest 23 or higher](https://jestjs.io/blog/2018/05/29/jest-23-blazing-fast-delightful-testing.html#custom-asynchronous-matchers). To run synchronous tests, use [spawn-with-mocks](https://github.com/raingerber/spawn-with-mocks#spawn-with-mocks) directly.

To enable mocks, the library will also write temporary files to disk, so it doesn't work if `fs.writeFileSync` is being mocked.

**Initialization**

```javascript
import shellMatchers from 'jest-shell-matchers'

beforeAll(() => {
  // calling this will add the matchers
  // by calling expect.extend
  shellMatchers()
})
```

**Example Without Mocks**

```javascript
describe('test the output from a spawned process', async () => {
  // this input will be executed by child_process.spawn
  const input = ['sh', ['./hello-world.sh']]
  const expectedOutput = {
    code: 0,
    stdout: 'Hello World\n',
    stderr: ''
  }
  // the matcher is asynchronous, so it *must* be awaited
  await expect(input).toHaveMatchingSpawnOutput(expectedOutput)
})

```

**Example With Mocks**

Mocks are created with the [spawn-with-mocks](https://github.com/raingerber/spawn-with-mocks#spawn-with-mocks) library, which documents the mocking API.

```javascript
/*
# mv.sh

# store the second arg in a variable:
SOURCE_DIR="$2"

mv "${SOURCE_DIR}" /target/dir     */

describe('test with mocks', async () => {
  const mocks = {
    // Mocking the "mv" command
    // It will receive the input parameters
    // that are passed to the shell command
    mv: jest.fn((sourceDir, targetDir) => {
      expect(sourceDir).toBe('/src/dir')
      expect(targetDir).toBe('/target/dir')
      return {
        exit: 0,
        stdout: '',
        stderr: ''
      }
    })
  }
  // "/src/dir" will be passed to the
  // first command in the script, which is "mv"
  const input = ['sh', ['./mv.sh', '/src/dir'], { mocks }]
  await expect(input).toHaveMatchingSpawnOutput(0)
  expect(mocks.mv).toHaveBeenCalledTimes(1)
})
```

## API

### expect([command[, args][, options]])

- To use the matchers, call `expect` with the input for [spawn-with-mocks#spawn](https://github.com/raingerber/spawn-with-mocks#spawn-command-args-options), which the matchers run internally. Like [child_process.spawn](https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options), it can execute a script, create mocks, set enviroment variables, etc. When passing `args` or `options`, the input for `expect` must be wrapped with an array:

```javascript
await expect('ls')
  .toHaveMatchingSpawnOutput(/*...*/)

await expect(['sh', ['./test.sh', 'a', 'b'])
  .toHaveMatchingSpawnOutput(/*...*/)
```

### **.toHaveMatchingSpawnOutput (expected)**

- The expected value can be a `Number`, `String`, `RegExp`, or `Object`.

```javascript
const input = ['sh', ['./test.sh']]

// Number - test the exit code
await expect(input).toHaveMatchingSpawnOutput(0)

// String - test the stdout for an exact match
await expect(input).toHaveMatchingSpawnOutput('Hello World')

// RegExp - test the stdout
await expect(input).toHaveMatchingSpawnOutput(/^Hello/)

// Object - test multiple properties at once
await expect(input).toHaveMatchingSpawnOutput({
  // The process exit code
  code: 0,
  // The signal that terminated the proces
  // for example, 'SIGTERM' or 'SIGKILL'
  signal: '',
  // The stdout from the process
  stdout: /^Hello/,
  // The stderr from the process
  stderr: ''
})
```

## LICENSE

MIT
