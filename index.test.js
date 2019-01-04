/* eslint-env jest */

const util = require('util')
const extendJestWithShellMatchers = require('./index')
const { runAllTestCasesForInput } = require('./src/matchers-test-utils')

beforeAll(() => {
  extendJestWithShellMatchers()
})

describe('initialization', () => {
  it('should throw when jest version >= 23 is not found', () => {
    const jestModule = require('jest')
    const getVersionSpy = jest.spyOn(jestModule, 'getVersion')
    const extendSpy = jest.spyOn(expect, 'extend')
    extendSpy.mockImplementation(() => undefined)
    getVersionSpy.mockImplementationOnce(() => undefined)
    expect(extendJestWithShellMatchers).toThrowErrorMatchingInlineSnapshot(
      `"jest-shell-matchers requires jest version >= 23"`
    )
    expect(getVersionSpy).toHaveBeenCalledTimes(1)
    getVersionSpy.mockImplementationOnce(() => '22.00.99')
    expect(extendJestWithShellMatchers).toThrowErrorMatchingInlineSnapshot(
      `"jest-shell-matchers requires jest version >= 23"`
    )
    expect(getVersionSpy).toHaveBeenCalledTimes(2)
    getVersionSpy.mockImplementationOnce(() => '23.00.00')
    expect(extendJestWithShellMatchers).not.toThrow()
    expect(getVersionSpy).toHaveBeenCalledTimes(3)
    getVersionSpy.mockRestore()
    extendSpy.mockRestore()
  })
})

describe('toHaveMatchingSpawnOutput - no mocks', () => {
  it('expecting a Number', async () => {
    const output = await runAllTestCasesForInput({
      input: ['sh', ['./test-scripts/exit-0.sh']],
      correctOutput: 0,
      incorrectOutput: 1
    })
    expect(output.correctMessageData.pass).toBe(true)
    expect(output.correctMessageData.message()).toMatchInlineSnapshot(`
"MATCHER HINT: .not.toBe

Expected exit code not to be:
  EXPECTED: 0
Received:
  RECEIVED: 0"
`)
    expect(output.incorrectMessageData.pass).toBe(false)
    expect(output.incorrectMessageData.message()).toMatchInlineSnapshot(`
"MATCHER HINT: .toBe

Expected exit code to be:
  EXPECTED: 1
Received:
  RECEIVED: 0"
`)
  })

  it('expecting a String', async () => {
    const output = await runAllTestCasesForInput({
      input: ['sh', ['./test-scripts/hello-world.sh']],
      correctOutput: `Hello World
`,
      incorrectOutput: `Jim Bob
Crinkleberry`
    })
    expect(output.correctMessageData.pass).toBe(true)
    expect(output.correctMessageData.message()).toMatchInlineSnapshot(`
"MATCHER HINT: .not.toBe

Expected stdout not to be:
  EXPECTED: \\"Hello World\\\\n\\"
Received:
  RECEIVED: \\"Hello World\\\\n\\""
`)
    expect(output.incorrectMessageData.pass).toBe(false)
    expect(output.incorrectMessageData.message()).toMatchInlineSnapshot(`
"MATCHER HINT: .toBe

Expected stdout to be:
  EXPECTED: \\"Jim Bob\\\\nCrinkleberry\\"
Received:
  RECEIVED: \\"Hello World\\\\n\\""
`)
  })

  it('expecting a RegExp', async () => {
    const output = await runAllTestCasesForInput({
      input: ['sh', ['./test-scripts/hello-world.sh']],
      correctOutput: /^Hello World/,
      incorrectOutput: /^Jim Bob/
    })
    expect(output.correctMessageData.pass).toBe(true)
    expect(output.correctMessageData.message()).toMatchInlineSnapshot(`
"MATCHER HINT: .not.toEqual

Expected stdout not to be:
  EXPECTED: {}
Received:
  RECEIVED: \\"Hello World\\\\n\\""
`)
    expect(output.incorrectMessageData.pass).toBe(false)
    expect(output.incorrectMessageData.message()).toMatchInlineSnapshot(`
"MATCHER HINT: .toEqual

Expected stdout to be:
  EXPECTED: {}
Received:
  RECEIVED: \\"Hello World\\\\n\\""
`)
  })

  it('expecting an Object', async () => {
    const output = await runAllTestCasesForInput({
      input: ['sh', ['./test-scripts/hello-world.sh']],
      correctOutput: {
        code: 0,
        stdout: /^Hello World/,
        stderr: ''
      },
      incorrectOutput: {
        code: 0,
        stdout: /^Jim Bob/,
        stderr: ''
      }
    })
    expect(output.correctMessageData.pass).toBe(true)
    expect(output.correctMessageData.message()).toMatchInlineSnapshot(`
"MATCHER HINT: .not.toEqual

Expected not to be:
  EXPECTED: {\\"code\\":0,\\"stdout\\":{},\\"stderr\\":\\"\\"}
Received:
  RECEIVED: {\\"code\\":0,\\"signal\\":\\"\\",\\"stdout\\":\\"Hello World\\\\n\\",\\"stderr\\":\\"\\"}"
`)
    expect(output.incorrectMessageData.pass).toBe(false)
    expect(output.incorrectMessageData.message()).toMatchInlineSnapshot(`
"MATCHER HINT: .toEqual

Expected:
  EXPECTED: {\\"code\\":0,\\"stdout\\":{},\\"stderr\\":\\"\\"}
Received:
  RECEIVED: {\\"code\\":0,\\"signal\\":\\"\\",\\"stdout\\":\\"Hello World\\\\n\\",\\"stderr\\":\\"\\"}"
`)
  })
})

describe('toHaveMatchingSpawnOutput - with mocks', () => {
  it('should mock the ls command', async () => {
    const ls = jest.fn(input => {
      return {
        exit: 0,
        stdout: ['frog', 'shrimp', 'crab'].join('\n'),
        stderr: ''
      }
    })
    const output = await runAllTestCasesForInput({
      input: [
        'sh',
        ['./test-scripts/ls-grep-frog.sh'],
        {
          mocks: {
            ls
          }
        }
      ],
      correctOutput: {
        code: 0,
        stdout: `frog
`
      },
      incorrectOutput: 1
    })
    expect(ls).toHaveBeenCalledTimes(4)
    expect(output.correctMessageData.pass).toBe(true)
    expect(output.correctMessageData.message()).toMatchInlineSnapshot(`
"MATCHER HINT: .not.toEqual

Expected not to be:
  EXPECTED: {\\"code\\":0,\\"stdout\\":\\"frog\\\\n\\"}
Received:
  RECEIVED: {\\"code\\":0,\\"signal\\":\\"\\",\\"stdout\\":\\"frog\\\\n\\",\\"stderr\\":\\"\\"}"
`)
    expect(output.incorrectMessageData.pass).toBe(false)
    expect(output.incorrectMessageData.message()).toMatchInlineSnapshot(`
"MATCHER HINT: .toBe

Expected exit code to be:
  EXPECTED: 1
Received:
  RECEIVED: 0"
`)
  })
})

describe('toHaveMatchingSpawnOutput - with args and options', () => {
  it('should set an environment variable and pass arguments to the command', async () => {
    const output = await runAllTestCasesForInput({
      input: [
        'sh',
        ['./test-scripts/input-output.sh', 124],
        {
          env: {
            TO_STDOUT: 'Pancake Soup',
            TO_STDERR: 'Strawberry Spaceship'
          }
        }
      ],
      correctOutput: {
        code: 124,
        stdout: `Pancake Soup
`,
        stderr: /^Strawberry Spaceship/
      },
      incorrectOutput: 1
    })
    expect(output.correctMessageData.pass).toBe(true)
    expect(output.correctMessageData.message()).toMatchInlineSnapshot(`
"MATCHER HINT: .not.toEqual

Expected not to be:
  EXPECTED: {\\"code\\":124,\\"stdout\\":\\"Pancake Soup\\\\n\\",\\"stderr\\":{}}
Received:
  RECEIVED: {\\"code\\":124,\\"signal\\":\\"\\",\\"stdout\\":\\"Pancake Soup\\\\n\\",\\"stderr\\":\\"Strawberry Spaceship\\\\n\\"}"
`)
    expect(output.incorrectMessageData.pass).toBe(false)
    expect(output.incorrectMessageData.message()).toMatchInlineSnapshot(`
"MATCHER HINT: .toBe

Expected exit code to be:
  EXPECTED: 1
Received:
  RECEIVED: 124"
`)
  })
})

describe('readme examples', () => {
  it('test the output from a spawned process', async () => {
    const input = ['sh', ['./test-scripts/hello-world.sh']]
    const expectedOutput = {
      code: 0,
      stdout: `Hello World
`,
      stderr: ''
    }
    await expect(input).toHaveMatchingSpawnOutput(expectedOutput)
  })
  it('with mock', async () => {
    expect.assertions(4)
    const mocks = {
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
    const input = ['sh', ['./test-scripts/mv.sh', '/src/dir'], { mocks }]
    await expect(input).toHaveMatchingSpawnOutput(0)
    expect(mocks.mv).toHaveBeenCalledTimes(1)
  })
})
