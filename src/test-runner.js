const util = require('util')

const constant = input => () => input

/**
 * not using util.types.isRegExp, in order
 * to support pre-v10.0.0 versions of node
 * @param {*} input
 * @returns {Boolean}
 */
function isRegExp (input) {
  return Object.prototype.toString.call(input) === '[object RegExp]'
}

/**
 * @param {Object} expected - expected value(s)
 * @param {Object} received - the output received from spawnPromise
 * @returns {Boolean} true if the objects match
 */
function getNonMatchingKeys (expected, received) {
  const keys = Object.keys(expected)
  const nonMatchingKeys = keys.filter(key => {
    let pass = false
    if (received.hasOwnProperty(key)) {
      const _expected = expected[key]
      const _received = received[key]
      if (isRegExp(_expected)) {
        pass = _expected.test(_received)
      } else {
        pass = _expected === _received
      }
    }
    return !pass
  })

  return {
    pass: nonMatchingKeys.length === 0,
    keys: nonMatchingKeys
  }
}

/**
 * @param {Number|String|Object|RegExp} expected
 * @param {Object} received - the output received from spawnProcess
 * @returns {Promise<Object>} resolves with "pass" and "message"
 *                            properties for the jest matcher api
 */
function compareExpectedToReceived (expected, received) {
  let pass
  let testProp = ''
  const typeOfExpected = isRegExp(expected) ? 'regexp' : typeof expected
  switch (typeOfExpected) {
    case 'number':
      testProp = 'exit code'
      received = received.code
      pass = expected === received
      break

    case 'string':
      testProp = 'stdout'
      received = received.stdout
      pass = expected === received
      break

    case 'regexp':
      testProp = 'stdout'
      received = received.stdout
      pass = expected.test(received)
      break

    default:
      const result = module.exports.getNonMatchingKeys(expected, received)
      pass = result.pass
  }

  const message = module.exports.createMessageFn.call(this, {
    testProp,
    expected,
    received,
    pass,
    typeOfExpected
  })

  return {
    message,
    pass
  }
}

/**
 * @param {Object} options
 * @returns {Function}
 */
function createMessageFn (options) {
  const { testProp, expected, received, pass, typeOfExpected } = options
  const isObject = typeOfExpected !== 'number' && typeOfExpected !== 'string'
  let matcherHint
  let expectedMessage = ''
  if (pass) {
    matcherHint = isObject ? '.not.toEqual' : '.not.toBe'
    // "When pass is true,
    // message should return the error message
    // for when expect(x).not.yourMatcher() fails."
    expectedMessage = testProp
      ? `Expected ${testProp} not to be:`
      : `Expected not to be:`
  } else {
    matcherHint = isObject ? '.toEqual' : '.toBe'
    // "When pass is false,
    // message should return the error message
    // for when expect(x).yourMatcher() fails."
    expectedMessage = testProp ? `Expected ${testProp} to be:` : `Expected:`
  }

  const message = [
    this.utils.matcherHint(matcherHint),
    '',
    expectedMessage,
    `  ${this.utils.printExpected(expected)}`,
    `Received:`,
    `  ${this.utils.printReceived(received)}`
  ].join('\n')
  return constant(message)
}

module.exports = {
  constant,
  isRegExp,
  getNonMatchingKeys,
  compareExpectedToReceived,
  createMessageFn
}
