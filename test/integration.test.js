const { assert } = require('chai')
const sinon = require('sinon')
const esmac = require('..')
const relative = require('../lib/specifiers/relative')
const package = require('../lib/specifiers/package')
const path = require('path')
const fixtureDir = path.resolve(__dirname, 'fixture')

describe('README.md', () => {
  it('(1) privatize lib/', () => {
    const subject = esmac([
      {
        source: 'lib/**',
        target: 'lib/**',
        specifier: relative
      }
    ])

    assert.match(subject({
      source: 'lib/a.js',
      target: 'lib/b.js',
      request: './b'
    }), [true, 0, sinon.match.any])

    assert.match(subject({
      source: 'packages/a/lib/index.js',
      target: 'lib/b.js',
      request: '../../../lib/b'
    }), null)

    assert.match(subject({
      source: 'lib/a.js',
      target: 'packages/a/lib/index.js',
      request: 'a'
    }), null)
  })

  it('(2) allow lib/ to access packages/', () => {
    const subject = esmac([
      {
        source: 'lib/**',
        target: 'lib/**',
        specifier: relative
      },
      {
        source: 'lib/**',
        target: 'packages/**',
        specifier: [package, {
          expand: file => path.resolve(fixtureDir, file)
        }]
      }
    ])

    assert.match(subject({
      source: 'lib/a.js',
      target: 'packages/foo/lib/index.js',
      request: 'foo'
    }), [true, 1, sinon.match.any])
  })

  it('(3) allow intra-package imports', () => {
    const subject = esmac([
      {
        source: 'lib/**',
        target: 'lib/**',
        specifier: relative
      },
      {
        source: 'lib/**',
        target: 'packages/**',
        specifier: [package, {
          expand: file => path.resolve(fixtureDir, file)
        }]
      },
      {
        source: 'packages/*/**',
        target: 'packages/*/**',
        boundary: 0,
        specifier: relative
      }
    ])

    assert.match(subject({
      source: 'packages/foo/lib/index.js',
      target: 'packages/foo/lib/a.js',
      request: './a'
    }), [true, 2, sinon.match.any])

    assert.match(subject({
      source: 'packages/foo/lib/index.js',
      target: 'packages/foo/lib/a.js',
      request: 'foo/lib/a'
    }), [false, 2, sinon.match.any])

    assert.match(subject({
      source: 'packages/foo/lib/index.js',
      target: 'packages/bar/lib/index.js',
      request: 'bar'
    }), null)
  })

  it('(4) allow inter-package imports', () => {
    const subject = esmac([
      {
        source: 'lib/**',
        target: 'lib/**',
        specifier: relative
      },
      {
        source: 'lib/**',
        target: 'packages/**',
        specifier: [package, {
          expand: file => path.resolve(fixtureDir, file)
        }]
      },
      {
        source: 'packages/*/**',
        target: 'packages/*/**',
        boundary: 0,
        specifier: relative
      },
      {
        source: '**',
        target: 'packages/**',
        specifier: [package, {
          expand: file => path.resolve(fixtureDir, file)
        }]
      }
    ])

    assert.match(subject({
      source: 'packages/foo/lib/index.js',
      target: 'packages/foo/lib/a.js',
      request: './a'
    }), [true, 2, sinon.match.any])

    assert.match(subject({
      source: 'packages/foo/lib/index.js',
      target: 'packages/foo/lib/a.js',
      request: 'foo/lib/a'
    }), [false, 2, sinon.match.any])

    assert.match(subject({
      source: 'packages/foo/lib/index.js',
      target: 'packages/bar/lib/index.js',
      request: 'bar'
    }), [true, 3, sinon.match.any])
  })

  it('(5) optimize', () => {
    const subject = esmac([
      {
        source: 'lib/**',
        target: 'lib/**',
        specifier: relative
      },
      {
        source: 'packages/*/**',
        target: 'packages/*/**',
        boundary: 0,
        specifier: relative
      },
      {
        source: '**',
        target: 'packages/**',
        specifier: [package, {
          expand: file => path.resolve(fixtureDir, file)
        }]
      }
    ])

    assert.match(subject({
      source: 'lib/a.js',
      target: 'lib/b.js',
      request: './b'
    }), [true, 0, sinon.match.any])

    assert.match(subject({
      source: 'lib/a.js',
      target: 'packages/foo/lib/index.js',
      request: 'foo'
    }), [true, 2, sinon.match.any])

    assert.match(subject({
      source: 'lib/a.js',
      target: 'packages/foo/lib/a.js',
      request: 'foo/lib/a'
    }), [true, 2, sinon.match.any])

    assert.match(subject({
      source: 'packages/foo/lib/index.js',
      target: 'packages/foo/lib/a.js',
      request: './a'
    }), [true, 1, sinon.match.any])

    assert.match(subject({
      source: 'packages/foo/lib/index.js',
      target: 'packages/bar/lib/index.js',
      request: 'bar'
    }), [true, 2, sinon.match.any])
  })
})
