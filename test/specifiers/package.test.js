const { assert } = require('chai')
const subject = require('esmac/specifiers/package')
const sinon = require('sinon')

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

  it('attempts to resolve a package.json with the specified package name', () => {
    const resolve = sinon.spy(() => null)

    subject({ target: 'lib/a.js', request: 'a' }, { resolve })
    assert.calledWith(resolve, 'lib/a.js', 'a')

    subject({ target: 'lib/a.js', request: 'a/b' }, { resolve })
    assert.calledWith(resolve, 'lib/a.js', 'a')

    subject({ target: 'lib/a.js', request: '@a/b' }, { resolve })
    assert.calledWith(resolve, 'lib/a.js', '@a/b')

    subject({ target: 'lib/a.js', request: '@a/b/c' }, { resolve })
    assert.calledWith(resolve, 'lib/a.js', '@a/b')

    assert.change({
      fn: () => subject({ target: 'lib/a.js', request: '@a/' }, { resolve }),
      of: () => resolve.callCount,
      by: 0
    })
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
