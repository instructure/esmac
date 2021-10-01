const invariant = require('invariant')
const micromatch = require('micromatch')

module.exports = (rules, specifiers) => {
  for (const rule of rules) {
    invariant(rule.source, `rule must match a source file`)
    invariant(rule.target, `rule must match a target file`)
    invariant(
      typeof rule.specifier === 'function' ||
      (Array.isArray(rule.specifier) && typeof rule.specifier[0] === 'function'),
      `rule must define a specifier to enforce`
    )
  }

  return (params) => {
    const { request, source, target } = params
    const rule = rules.find(candidate => {
      if (!micromatch.isMatch(source, candidate.source)) {
        return false
      }

      if (!micromatch.isMatch(target, candidate.target)) {
        return false
      }

      if (typeof candidate.boundary === 'number') {
        const sourceGroups = micromatch.capture(candidate.source, source)
        const targetGroups = micromatch.capture(candidate.target, target)

        return (
          sourceGroups[candidate.boundary] ===
          targetGroups[candidate.boundary]
        )
      }

      return true
    })

    if (rule) {
      const [ specifier, specifierOptions = {} ] = arrayWrap(rule.specifier)
      const specifierState = {}

      return [
        specifier(params, specifierOptions, specifierState),
        rules.indexOf(rule),
        specifierState
      ]
    }
    else {
      return [null, null, null]
    }
  }
}

const arrayWrap = x => Array.isArray(x) ? x : [x]