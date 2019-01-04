/* eslint-env jest */

jest.mock('child_process')

const { isRegExp, getNonMatchingKeys } = require('./test-runner')

describe('isRegExp', () => {
  it('should be true', () => {
    expect(isRegExp(/RegExp/)).toBe(true)
  })

  it('should be false', () => {
    expect(isRegExp('RegExp')).toBe(false)
  })
})

describe('getNonMatchingKeys', () => {
  it('{} === {}', () => {
    const result = getNonMatchingKeys({}, {})
    expect(result).toEqual({
      pass: true,
      keys: []
    })
  })

  it('matching objects #1', () => {
    const result = getNonMatchingKeys({ code: 0 }, { code: 0 })
    expect(result).toEqual({
      pass: true,
      keys: []
    })
  })

  it('matching objects #2', () => {
    const result = getNonMatchingKeys(
      {
        code: 0,
        signal: 'SIGTERM',
        stdout: /H/,
        stderr: ''
      },
      {
        code: 0,
        signal: 'SIGTERM',
        stdout: 'H',
        stderr: ''
      }
    )
    expect(result).toEqual({
      pass: true,
      keys: []
    })
  })

  it('matching objects #3', () => {
    const result = getNonMatchingKeys({}, { code: 0 })
    expect(result).toEqual({
      pass: true,
      keys: []
    })
  })

  it('non-matching objects #1', () => {
    const result = getNonMatchingKeys({ code: 12 }, {})
    expect(result).toEqual({
      pass: false,
      keys: ['code']
    })
  })

  it('non-matching objects #2', () => {
    const result = getNonMatchingKeys({ randomKey: true }, { code: 0 })
    expect(result).toEqual({
      pass: false,
      keys: ['randomKey']
    })
  })

  it('non-matching objects #3', () => {
    const result = getNonMatchingKeys(
      {
        code: 0,
        signal: 'SIGTERM',
        stdout: /H/,
        stderr: ''
      },
      {
        code: 1,
        signal: 'SIGTERM',
        stdout: 'H',
        stderr: ''
      }
    )
    expect(result).toEqual({
      pass: false,
      keys: ['code']
    })
  })

  it('non-matching objects #4', () => {
    const result = getNonMatchingKeys(
      {
        code: 0,
        signal: 'SIGTERM',
        stdout: /H/,
        stderr: ''
      },
      {
        code: 0,
        signal: 'SIGPIPE',
        stdout: 'H',
        stderr: ''
      }
    )
    expect(result).toEqual({
      pass: false,
      keys: ['signal']
    })
  })

  it('non-matching objects #5', () => {
    const result = getNonMatchingKeys(
      {
        code: 0,
        signal: 'SIGTERM',
        stdout: /H/,
        stderr: ''
      },
      {
        code: 0,
        signal: 'SIGTERM',
        stdout: 'Q',
        stderr: ''
      }
    )
    expect(result).toEqual({
      pass: false,
      keys: ['stdout']
    })
  })

  it('non-matching objects #6', () => {
    const result = getNonMatchingKeys(
      {
        code: 0,
        signal: 'SIGTERM',
        stdout: /H/,
        stderr: /^Error/
      },
      {
        code: 0,
        signal: 'SIGTERM',
        stdout: 'H',
        stderr: ''
      }
    )
    expect(result).toEqual({
      pass: false,
      keys: ['stderr']
    })
  })
})
