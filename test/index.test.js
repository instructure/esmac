const { assert } = require('chai')
const sinon = require('sinon')
const esmac = require('esmac')

describe('esmac', () => {
  it("applies a rule's specifier", () => {
    const specifier = sinon.spy(() => true)
    const subject = esmac([
      {
        source: '**',
        target: '**',
        specifier
      }
    ])

    const dependency = {
      source: 'a.js',
      target: 'b.js',
      request: './b'
    }

    const [valid] = subject(dependency)

    assert.calledWith(specifier, dependency)
    assert.equal(valid, true)
  })

  it("passes options to the specifier", () => {
    const specifier = sinon.stub()
    const options = {}
    const subject = esmac([
      {
        source: '**',
        target: '**',
        specifier: [specifier, options]
      }
    ])

    subject({
      source: 'a.js',
      target: 'b.js',
      request: './b'
    })

    assert.calledWith(specifier, sinon.match.object, options)
  })

  it('returns null if no rule is applicable', () => {
    const subject = esmac([])

    assert.equal(subject({
      source: 'a',
      target: 'b',
      request: './b'
    }), null)
  })

  it('disqualifies a rule if boundary does not match', () => {
    const specifier = sinon.stub()
    const subject = esmac([
      {
        source: 'packages/*/**',
        target: 'packages/*/**',
        boundary: 0,
        specifier
      }
    ])

    assert.change({
      fn: () => subject({
        source: 'packages/foo/lib/index.js',
        target: 'packages/foo/lib/a.js',
        request: './a'
      }),
      of: () => specifier.callCount,
      by: 1
    })

    assert.change({
      fn: () => subject({
        source: 'packages/foo/lib/index.js',
        target: 'packages/bar/lib/index.js',
        request: 'bar/lib/index.js'
      }),
      of: () => specifier.callCount,
      by: 0
    })
  })
})
