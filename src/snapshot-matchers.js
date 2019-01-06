const spawnWithMocks = require('spawn-with-mocks')
const {toMatchSnapshot} = require('jest-snapshot')
const testRunner = require('./test-runner')

/**
 * @param {String|Array} input
 * @returns {Promise}
 */
async function toHaveSpawnOutputMatchingSnapshot (input) {
  const received = await spawnWithMocks.spawnPromise(...input)
  return toMatchSnapshot.call(
    this,
    received,
    'toHaveSpawnOutputMatchingSnapshot'
  )
}


/**
 * @param {String|Array} input
 * @returns {Promise}
 */
async function toHaveStdoutMatchingSnapshot (input) {
  const received = await spawnWithMocks.spawnPromise(...input)
  return toMatchSnapshot.call(
    this,
    received.stdout,
    'toHaveStdoutMatchingSnapshot'
  )
}

/**
 * @param {String|Array} input
 * @returns {Promise}
 */
async function toHaveStderrMatchingSnapshot (input) {
  const received = await spawnWithMocks.spawnPromise(...input)
  return toMatchSnapshot.call(
    this,
    received.stderr,
    'toHaveStderrMatchingSnapshot'
  )
}

module.exports = {
  toHaveSpawnOutputMatchingSnapshot,
  toHaveStdoutMatchingSnapshot,
  toHaveStderrMatchingSnapshot
}

