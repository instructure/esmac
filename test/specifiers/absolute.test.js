const { assert } = require('chai')
const subject = require('../../lib/specifiers/absolute')

describe('specifiers/absolute', () => {
  it('considers / to be absolute', () => {
    assert.ok(subject({ request: '/' }))
  })

  it('considers /foo to be absolute', () => {
    assert.ok(subject({ request: '/foo' }))
    assert.ok(subject({ request: '/foo/bar' }))
    assert.ok(subject({ request: '/foo/bar/baz' }))
  })

  it('ignores scheme', () => {
    assert.ok(subject({ request: 'file:///' }))
    assert.ok(subject({ request: 'file:///foo/bar/baz' }))
  })

  it('considers nothing else to be absolute', () => {
    assert.notOk(subject({ request: 'blah' }))
    assert.notOk(subject({ request: './blah' }))
    assert.notOk(subject({ request: '.blah' }))
  })
})
