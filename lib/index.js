const invariant = require('invariant')
const micromatch = require('micromatch')

// Find the rule that applies to the given dependency and check its specifier
module.exports = rules => {
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
      const [ specifier, specifierOptions = {} ] = rule.specifier
      const specifierOutput = {}

      return [
        specifier(dependency, specifierOptions, specifierOutput),
        rules.indexOf(rule),
        specifierOutput
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

