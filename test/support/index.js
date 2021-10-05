const assertChange = require('chai-assert-change')
const chai = require('chai')
const sinon = require('sinon')

sinon.assert.expose(chai.assert, { prefix: '' })
chai.assert.change = assertChange
