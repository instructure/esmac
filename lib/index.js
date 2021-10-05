const invariant = require('invariant')
const micromatch = require('micromatch')

module.exports = rules => createChecker(rules.map(createSpecifierTuples))

// Find the rule that applies to the given dependency and check its specifier
const createChecker = rules => {
  for (const rule of rules) {
    invariant(rule.source, `rule must match a source file`)
    invariant(rule.target, `rule must match a target file`)
    invariant(typeof rule.specifier[0] === 'function',
      `rule must define a specifier to enforce`
    )
  }

  return dependency => {
    const { request, source, target } = dependency
    const rule = findApplicableRule(rules, dependency)

    if (rule) {
      const [ specifier, specifierOptions ] = rule.specifier

      return [
        specifier(dependency, specifierOptions),
        rules.indexOf(rule)
      ]
    }
    else {
      return null
    }
  }
}

const findApplicableRule = (rules, { source, target }) => rules.find(rule => {
  const sourceCaptures = micromatch.capture(rule.source, source)

  if (!sourceCaptures) {
    return false
  }

  const targetCaptures = micromatch.capture(rule.target, target)

  if (!targetCaptures) {
    return false
  }

  if (typeof rule.boundary === 'number') {
    return sourceCaptures[rule.boundary] === targetCaptures[rule.boundary]
  }

  return true
})

const createSpecifierTuples = rule => {
  if (!Array.isArray(rule.specifier)) {
    rule.specifier = [rule.specifier]
  }

  if (!rule.specifier[1]) {
    rule.specifier[1] = {}
  }

  return rule
}
