const findUp = require('find-up')
const path = require('path')
const bare = require('./bare')

module.exports = (dependency, { resolve = resolvePackageJSON, expand = identity }) => {
  if (!bare(dependency)) {
    return false
  }

  const { target, request } = dependency
  const packageName = extractPackageName(request)

  if (!packageName) {
    return false
  }

  const [ pjsonFile, pjson ] = resolve(expand(target), packageName) || []

  if (!pjsonFile) {
    return false
  }

  return request.startsWith(packageName)
}

// see ESM_RESOLVE https://nodejs.org/api/esm.html#esm_resolver_algorithm_specification
const resolvePackageJSON = (file, name) => {
  const pjsonFile = findUp.sync('package.json', { cwd: path.dirname(file) })

  if (!pjsonFile) {
    return null
  }

  const pjson = require(pjsonFile)

  if (pjson.name && pjson.name === name) {
    return [pjsonFile, pjson]
  }
  else {
    return resolvePackageJSON(path.dirname(pjsonFile), name)
  }
}

// see PACKAGE_RESOLVE in https://nodejs.org/api/esm.html#esm_resolver_algorithm_specification
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

const identity = x => x
