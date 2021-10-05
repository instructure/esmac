const { assert } = require('chai')
const subject = require('esmac/specifiers/bare')

describe('specifiers/bare', () => {
  it('considers foo to be bare', () => {
    assert.ok(subject({ request: 'foo' }))
  })

  it('considers foo/bar to be bare', () => {
    assert.ok(subject({ request: 'foo/bar' }))
  })

  it('considers @foo/bar to be bare', () => {
    assert.ok(subject({ request: '@foo/bar' }))
  })

  it('considers nothing else to be bare', () => {
    assert.notOk(subject({ request: '/blah' }))
    assert.notOk(subject({ request: './blah' }))
  })
})
