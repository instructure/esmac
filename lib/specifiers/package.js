const findUp = require('find-up')
const path = require('path')

module.exports = (
  { target, request },
  { resolve = findNamedManifestOnDisk, expand = identity },
  state
) => {
  const [ pjsonFile, pjson ] = resolve(expand(target)) || []

  if (!pjsonFile) {
    return false
  }

  state.pjsonFile = pjsonFile
  state.pjson = pjson

  // TODO: it's more nuanced than startsWith, we need at least a \b
  return request.startsWith(pjson.name)
}

// see https://nodejs.org/api/esm.html#esm_resolver_algorithm_specification
const findNamedManifestOnDisk = (file) => {
  const pjsonFile = findUp.sync('package.json', { cwd: path.dirname(file) })

  if (!pjsonFile) {
    return null
  }

  const pjson = require(pjsonFile)

  if (pjson.name) {
    return [pjsonFile, pjson]
  }
  else {
    return findNamedManifestOnDisk(path.dirname(pjsonFile))
  }
}

const identity = x => x
