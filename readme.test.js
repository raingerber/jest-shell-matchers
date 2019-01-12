const extendJestWithShellMatchers = require('./index')

beforeAll(() => {
  extendJestWithShellMatchers()
})

describe('README.md', () => {
  it('should test the output from a spawned process', async () => {
    const input = ['sh', ['./hello-world.sh']]
    const expectedOutput = {
      code: 0,
      signal: '',
      stdout: 'Hello World\n',
      stderr: ''
    }
    await expect(input).toHaveMatchingSpawnOutput(expectedOutput)
  })

  it('should mock the date and mkdir commands', async () => {
    const date = jest.fn((...input) => {
      expect(input).toEqual(['+%m-%d-%Y'])
      return {
        code: 0,
        stdout: '01-06-2019',
        stderr: ''
      }
    })

    const mkdir = jest.fn((...input) => {
      expect(input).toEqual(['01-06-2019'])
      return {
        code: 0,
        stdout: '',
        stderr: ''
      }
    })

    const mocks = { date, mkdir }
    const input = ['sh', ['./test-scripts/mkdir.sh'], { mocks }]
    await expect(input).toHaveMatchingSpawnOutput(0)
    expect(date).toHaveBeenCalledTimes(1)
    expect(mkdir).toHaveBeenCalledTimes(1)
    expect(date.mock.calls[0]).toEqual(['+%m-%d-%Y'])
    expect(mkdir.mock.calls[0]).toEqual(['01-06-2019'])
  })
})
