const spawnWithMocks = require('spawn-with-mocks')
const testRunner = require('./test-runner')

/**
 * @param {String|Array} input
 * @param {Number|String|Object|RegExp} expected
 * @returns {Promise<Object>} resolves with "pass" and "message"
 *                            properties for the jest matcher api
 */
async function toHaveMatchingSpawnOutput (input, expected) {
  const received = await spawnWithMocks.spawnPromise(...input)
  return testRunner.compareExpectedToReceived.call(this, expected, received)
}

/**
 * async matchers are supported by jest >= 23
 * @returns {Boolean}
 */
function supportsAsyncMatchers () {
  try {
    return (
      require('jest')
        .getVersion()
        .split('.')[0] >= 23
    )
  } catch (e) {
    return false
  }
}

function extendJestWithShellMatchers () {
  if (!supportsAsyncMatchers()) {
    throw new Error('jest-shell-matchers requires jest version >= 23')
  }

  // eslint-disable-next-line no-undef
  expect.extend({
    toHaveMatchingSpawnOutput
  })
}

module.exports = {
  toHaveMatchingSpawnOutput,
  supportsAsyncMatchers,
  extendJestWithShellMatchers
}
