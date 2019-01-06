const extendJestWithShellMatchers = require('../index')

beforeAll(() => {
  extendJestWithShellMatchers()
})

describe('snapshot matchers', () => {
  const input = [
    'sh',
    ['./test-scripts/input-output.sh'], {
      env: {
        TO_STDOUT: `The glorious gods
  sit in hourly synod about thy
      particular prosperity
`,
        TO_STDERR: `A noble fellow,
        I warrant him.`,
      }
    }
  ]
  it('toHaveSpawnOutputMatchingSnapshot', async () => {
    await expect(input).toHaveSpawnOutputMatchingSnapshot()
  })
  it('toHaveStdoutMatchingSnapshot', async () => {
    await expect(input).toHaveStdoutMatchingSnapshot()
  })
  it('toHaveStderrMatchingSnapshot', async () => {
    await expect(input).toHaveStderrMatchingSnapshot()
  })
})

