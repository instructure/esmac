const { assert } = require('chai')
const subject = require('../../lib/specifiers/relative')

describe('specifiers/relative', () => {
  it('considers . to be relative', () => {
    assert.ok(subject({ request: '.' }))
  })

  it('considers .. to be relative', () => {
    assert.ok(subject({ request: '..' }))
  })

  it('considers ./ to be relative', () => {
    assert.ok(subject({ request: './' }))
    assert.ok(subject({ request: './foo' }))
    assert.ok(subject({ request: './foo/bar' }))
  })

  it('considers ../ to be relative', () => {
    assert.ok(subject({ request: '../' }))
    assert.ok(subject({ request: '../foo' }))
    assert.ok(subject({ request: '../foo/bar' }))
  })

  it('ignores whitespace', () => {
    assert.ok(subject({ request: ' .' }))
    assert.ok(subject({ request: '. ' }))
    assert.ok(subject({ request: ' ..' }))
    assert.ok(subject({ request: '.. ' }))
    assert.ok(subject({ request: './foo ' }))
    assert.ok(subject({ request: ' ./bar' }))
  })

  it('considers nothing else to be relative', () => {
    assert.notOk(subject({ request: 'blah' }))
    assert.notOk(subject({ request: '/blah' }))
    assert.notOk(subject({ request: '.blah' }))
  })
})
