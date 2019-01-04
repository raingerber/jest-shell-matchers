/* eslint-env jest */

const testRunner = require('./test-runner')

const { compareExpectedToReceived } = testRunner

let compareExpectedToReceivedSpy

beforeEach(() => {
  compareExpectedToReceivedSpy = jest.spyOn(
    testRunner,
    'compareExpectedToReceived'
  )
})

afterEach(() => {
  compareExpectedToReceivedSpy.mockRestore()
})

async function runTestForSpawnInput (options) {
  const { pass, input, expected } = options
  if (pass) {
    await expect(input).toHaveMatchingSpawnOutput(expected)
  } else {
    await expect(input).not.toHaveMatchingSpawnOutput(expected)
  }
  compareExpectedToReceivedSpy.mockClear()
  // The test should always pass, because we're testing
  // the input to the compareExpectedToReceivedSpy mock
  // instead of testing the final output from the test
  compareExpectedToReceivedSpy.mockImplementationOnce((...input) => {
    return {
      pass,
      // The test passes, so this function should never be called
      message: () => 'Ignore this message'
    }
  })

  const mockThis = {
    isNot: !pass,
    // expand: true,
    utils: {
      matcherHint: jest.fn(x => `MATCHER HINT: ${x}`),
      printExpected: jest.fn(x => `EXPECTED: ${x}`),
      printReceived: jest.fn(x => `RECEIVED: ${x}`)
    }
  }

  if (pass) {
    await expect(input).toHaveMatchingSpawnOutput(expected)
  } else {
    await expect(input).not.toHaveMatchingSpawnOutput(expected)
  }

  expect(compareExpectedToReceivedSpy).toBeCalledTimes(1)
  const args = compareExpectedToReceivedSpy.mock.calls[0]
  return compareExpectedToReceived.call(mockThis, ...args)
}

async function runAllTestCasesForInput (options) {
  const { input, correctOutput, incorrectOutput } = options
  return {
    correctMessageData: await runTestForSpawnInput({
      input,
      expected: correctOutput,
      pass: true
    }),
    incorrectMessageData: await runTestForSpawnInput({
      input,
      expected: incorrectOutput,
      pass: false
    })
  }
}

module.exports = {
  runTestForSpawnInput,
  runAllTestCasesForInput
}
