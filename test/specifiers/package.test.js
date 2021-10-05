const { assert } = require('chai')
const subject = require('esmac/specifiers/package')
const sinon = require('sinon')

describe('specifiers/package', () => {
  it('fails if request is not bare', () => {
    const options = [{ resolve: () => null }]

    assert.notOk(subject({ target: 'lib/a.js', request: './a' }, ...options))
    assert.notOk(subject({ target: 'lib/a.js', request: '/a' }, ...options))
  })

  it('fails if package.json could not be found', () => {
    assert.notOk(
      subject({
        target: 'lib/a.js',
        request: 'a'
      }, {
        resolve: () => null
      })
    )
  })

  it('attempts to resolve a package.json with the specified package name', () => {
    let resolve = sinon.spy(() => null)
    subject({ target: 'lib/a.js', request: 'a' }, { resolve })
    assert.calledWith(resolve, 'lib/a.js', 'a')

    resolve.resetHistory()
    subject({ target: 'lib/a.js', request: 'a/b' }, { resolve })
    assert.calledWith(resolve, 'lib/a.js', 'a')

    resolve.resetHistory()
    subject({ target: 'lib/a.js', request: '@a/b' }, { resolve })
    assert.calledWith(resolve, 'lib/a.js', '@a/b')

    resolve.resetHistory()
    subject({ target: 'lib/a.js', request: '@a/b/c' }, { resolve })
    assert.calledWith(resolve, 'lib/a.js', '@a/b')

    resolve.resetHistory()
    subject({ target: 'lib/a.js', request: '@a/' }, { resolve })
    assert.notCalled(resolve)
  })

  it('works iff package.json was found and has the specified name', () => {
    assert.ok(
      subject({
        target: 'packages/foo/lib/a.js',
        request: 'foo'
      }, {
        resolve: () => ([ 'packages/foo/package.json', { name: 'foo' } ])
      })
    )
  })
})
