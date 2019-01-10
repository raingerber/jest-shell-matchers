# jest-shell-matchers

> Test shell scripts while mocking specific commands

Run shell scripts and make assertions about the exit code, stdout, stderr, and termination signal that are generated. It uses the [spawn-with-mocks](https://www.npmjs.com/package/spawn-with-mocks) library, so mocks can be written for specific shell commands.

[![Build Status](https://travis-ci.org/raingerber/jest-shell-matchers.svg?branch=master)](https://travis-ci.org/raingerber/jest-shell-matchers) [![codecov](https://codecov.io/gh/raingerber/jest-shell-matchers/branch/master/graph/badge.svg)](https://codecov.io/gh/raingerber/jest-shell-matchers)

## Usage

The library exposes [asynchronous matchers](https://jestjs.io/docs/en/expect#async-matchers), so it requires [Jest 23 or higher](https://jestjs.io/blog/2018/05/29/jest-23-blazing-fast-delightful-testing.html#custom-asynchronous-matchers) (to run synchronous tests, use [spawn-with-mocks](https://www.npmjs.com/package/spawn-with-mocks) directly). Mocks are created by writing temporary files to disk, so they do not work if `fs.writeFileSync` is being mocked.

**Initialization**

```javascript
const shellMatchers = require('jest-shell-matchers')

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
    signal: '',
    stdout: 'Hello World\n',
    stderr: '',
  }
  // the matcher is asynchronous, so it *must* be awaited
  await expect(input).toHaveMatchingSpawnOutput(expectedOutput)
})

```

**Example With Mocks**

Mocks are created by [spawn-with-mocks](https://www.npmjs.com/package/spawn-with-mocks), which documents the mocking API. In this example, we mock the `date` and `mkdir` commands:

```javascript
/*
# mkdir.sh
# this script creates a directory
# named after the current date

DIR_NAME=$(date +'%m-%d-%Y')
mkdir $DIR_NAME
*/

// Mocking the output
// for the date command
const date = () => {
  return {
    code: 0,
    stdout: '01-06-2019',
    stderr: ''
  }
}

// Testing the input to mkdir,
// and mocking the output
const mkdir = jest.fn(dir => {
  expect(dir).toBe('01-06-2019')
  return {
    code: 0,
    stdout: '',
    stderr: ''
  }
})

const mocks = { date, mkdir }
const input = ['sh', ['./mkdir.sh'], { mocks }]
await expect(input).toHaveMatchingSpawnOutput(0)
expect(mocks.mkdir).toHaveBeenCalledTimes(1)
```

Mocks can also return a `Number` or `String` to shorten the code:

```javascript
// The string is shorthand for stdout;
// stderr will be '' and the exit code will be 0
const date = () => '01-06-2019'

// The number is shorthand for the exit code
// stdout and stderr will be ''
const mkdir = dir => 0
```

## API

### expect([command[, args][, options]])

- To use the matchers, call `expect` with the input for [spawn-with-mocks#spawn](https://github.com/raingerber/spawn-with-mocks#spawn-command-args-options), which the matchers run internally. It can execute a script, create mocks, set enviroment variables, etc. When passing `args` or `options`, the input must be wrapped with an array:

```javascript
await expect('ls')
  .toHaveMatchingSpawnOutput(/*...*/)

await expect(['sh', ['./test.sh'], { mocks }])
  .toHaveMatchingSpawnOutput(/*...*/)
```

### **.toHaveMatchingSpawnOutput (expected)**

- The expected value can be a `Number`, `String`, `RegExp`, or `Object`.

```javascript
const input = ['sh', ['./test.sh']]

await expect(input)
  // Number: test the exit code
  .toHaveMatchingSpawnOutput(0)

await expect(input)
  // String: test the stdout for an exact match
  .toHaveMatchingSpawnOutput('Hello World')

await expect(input)
  // RegExp: test the stdout
  .toHaveMatchingSpawnOutput(/^Hello/)

await expect(input)
  // Object: the values can be Numbers, Strings, or RegExps
  .toHaveMatchingSpawnOutput({
    // The exit code
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
