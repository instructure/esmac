const { assert } = require('chai')
const subject = require('../../lib/specifiers/any')

describe('specifiers/any', () => {
  it('yolo', () => {
    assert.ok(subject({ request: ' ' }))
    assert.ok(subject({ request: '.' }))
    assert.ok(subject({ request: '..' }))
    assert.ok(subject({ request: '../foo' }))
    assert.ok(subject({ request: '/' }))
    assert.ok(subject({ request: 'foo' }))
  })
})
