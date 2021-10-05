const { assert } = require('chai')
const esmac = require('../lib')

describe('esmac/specifiers/relative', () => {
  const relative = require('../lib/specifiers/relative')

  it('allows consumption', () => {
    const subject = esmac([
      {
        source: '**/*',
        target: '**/*',
        specifier: relative
      }
    ])

    assert.deepEqual([true,0], subject({
      source: 'foo/lib/index.js',
      target: 'bar/lib/index.js',
      request: '../../bar/lib/index.js'
    }).slice(0,2))
  })

  it('allows consumption inside a boundary', () => {
    const subject = esmac([
      {
        source: '**/*/*',
        target: '**/*/*',
        boundary: 1,
        specifier: relative
      }
    ])

    assert.deepEqual([true,0], subject({
      source: 'foo/lib/a.js',
      target: 'foo/lib/b.js',
      request: './b'
    }).slice(0,2))
  })

  it('prohibits consumption of a module outside a boundary', () => {
    const subject = esmac([
      {
        source: '**/*/*',
        target: '**/*/*',
        boundary: 1,
        specifier: relative
      }
    ])

    assert.deepEqual([true,0], subject({
      source: 'foo/lib/index.js',
      target: 'bar/lib/index.js',
      request: '../../bar/lib/index.js'
    }).slice(0,2))
  })
})

describe('esmac/specifiers/package', () => {
  const package = require('../lib/specifiers/package')

  it('allows consumption', () => {
    const subject = esmac([
      {
        source: '**/*',
        target: 'packages/*/**',
        specifier: [package, {
          resolve: file => (['buffer',{ name: 'foo' }])
        }]
      }
    ])

    assert.deepEqual([true,0], subject({
      source: 'blah.js',
      target: 'packages/foo/lib/index.js',
      request: 'foo'
    }).slice(0,2))
  })

  it('allows consumption of deep files', () => {
    const subject = esmac([
      {
        source: '**/*',
        target: 'packages/*/**',
        specifier: [package, {
          resolve: file => (['buffer',{ name: 'foo' }])
        }]
      }
    ])

    assert.deepEqual([true,0], subject({
      source: 'blah.js',
      target: 'packages/foo/lib/a.js',
      request: 'foo/lib/a.js'
    }).slice(0,2))
  })

  it('fails if package could not be resolved', () => {
    const subject = esmac([
      {
        source: '**/*',
        target: 'packages/*/**',
        specifier: [package, {
          resolve: () => null
        }]
      }
    ])

    assert.deepEqual([false,0], subject({
      source: 'blah.js',
      target: 'packages/foo/lib/index.js',
      request: 'foo'
    }).slice(0,2))
  })

  it('fails if package name does not match the request', () => {
    const subject = esmac([
      {
        source: '**/*',
        target: 'packages/*/**',
        specifier: [package, {
          resolve: () => (['buffer',{ name: 'bar' }])
        }]
      }
    ])

    assert.deepEqual([false,0], subject({
      source: 'blah.js',
      target: 'packages/foo/lib/index.js',
      request: 'foo'
    }).slice(0,2))
  })

  it('fails if resolved package is not at the specified boundary', () => {
    const subject = esmac([
      {
        source: '**/*',
        target: 'packages/*/**',
        specifier: [package, {
          resolve: () => (['package.json', { name: 'foo' }]),
          boundary: 0
        }]
      }
    ])

    assert.deepEqual([false,0], subject({
      source: 'blah.js',
      target: 'packages/foo/lib/index.js',
      request: 'foo'
    }).slice(0,2))
  })
})
