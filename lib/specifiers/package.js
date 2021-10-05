const findUp = require('find-up')
const path = require('path')

module.exports = (
  { target, request },
  { resolve = findNamedManifestOnDisk, expand = identity },
  state
) => {
  const packageName = extractPackageName(request)

  if (!packageName) {
    return false
  }

  const [ pjsonFile, pjson ] = resolve(expand(target), packageName) || []

  if (!pjsonFile) {
    return false
  }

  state.pjsonFile = pjsonFile
  state.pjson = pjson

  return true
}

// see https://nodejs.org/api/esm.html#esm_resolver_algorithm_specification
const findNamedManifestOnDisk = (file, name) => {
  const pjsonFile = findUp.sync('package.json', { cwd: path.dirname(file) })

  if (!pjsonFile) {
    return null
  }

  const pjson = require(pjsonFile)

  if (pjson.name && pjson.name === name) {
    return [pjsonFile, pjson]
  }
  else {
    return findNamedManifestOnDisk(path.dirname(pjsonFile))
  }
}

const identity = x => x

const extractPackageName = specifier => {
  if (specifier.startsWith('@')) {
    const scope = specifier.split('/').slice(0, 2).join('/')

    if (scope.endsWith('/')) {
      return null
    }

    return scope
  }
  else {
    return specifier.split('/')[0]
  }
}
