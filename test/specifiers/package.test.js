const { assert } = require('chai')
const subject = require('../../lib/specifiers/package')

describe('specifiers/package', () => {
  it('fails if package.json could not be found', () => {
    assert.notOk(
      subject({
        target: 'lib/a.js',
        request: 'a'
      }, {
        resolve: () => null
      }, {})
    )
  })

  it('fails if package.json "name" does not match the specified one', () => {
    assert.notOk(
      subject({
        target: 'lib/a.js',
        request: 'a'
      }, {
        resolve: () => ([ 'package.json', { name: 'b' } ])
      }, {})
    )
  })

  it('works iff package.json was found and has the specified name', () => {
    assert.ok(
      subject({
        target: 'packages/foo/lib/a.js',
        request: 'foo'
      }, {
        resolve: () => ([ 'packages/foo/package.json', { name: 'foo' } ])
      }, {})
    )
  })

  it('emits pjsonFile and pjson for diagnostics', () => {
    const output = {}
    assert.ok(
      subject({
        target: 'packages/foo/lib/a.js',
        request: 'foo'
      }, {
        resolve: () => ([ 'packages/foo/package.json', { name: 'foo' } ])
      }, output)
    )

    assert.deepEqual(output.pjsonFile, 'packages/foo/package.json')
    assert.deepEqual(output.pjson, { name: 'foo' })
  })
})
