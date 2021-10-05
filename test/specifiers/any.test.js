const { assert } = require('chai')
const subject = require('esmac/specifiers/any')

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
