const invariant = require('invariant')
const micromatch = require('micromatch')

module.exports = (_rules, specifiers) => {
  const rules = _rules.map(rule => ({...rule, specifier: asArray(rule.specifier) }))

  for (const rule of rules) {
    invariant(rule.source, `rule must match a source file`)
    invariant(rule.target, `rule must match a target file`)
    invariant(typeof rule.specifier[0] === 'function',
      `rule must define a specifier to enforce`
    )
    // invariant(
    //   typeof rule.specifier === 'function' ||
    //   (Array.isArray(rule.specifier) && typeof rule.specifier[0] === 'function'),
    //   `rule must define a specifier to enforce`
    // )
  }

  return (params) => {
    const { request, source, target } = params
    const { rule, captures } = findApplicableRule(rules, params)

    if (rule) {
      const [ specifier, specifierOptions = {} ] = rule.specifier
      const specifierState = {}

      return [
        specifier({...params, captures}, specifierOptions, specifierState),
        rules.indexOf(rule),
        specifierState
      ]
    }
    else {
      return [null, null, null]
    }
  }
}

const asArray = x => Array.isArray(x) ? x : [x]
const findApplicableRule = (rules, { source, target }) => rules.reduce((acc, rule) => {
  if (acc.rule) {
    return acc
  }

  const sourceCaptures = micromatch.capture(rule.source, source)

  if (!sourceCaptures) {
    return acc
  }

  const targetCaptures = micromatch.capture(rule.target, target)

  if (!targetCaptures) {
    return acc
  }

  if (typeof rule.boundary === 'number') {
    if (
      sourceCaptures[rule.boundary] !==
      targetCaptures[rule.boundary]
    ) {
      return acc
    }
  }

  return {
    rule,
    captures: {
      source: sourceCaptures,
      target: targetCaptures,
    }
  }
}, { rule: null, captures: null })