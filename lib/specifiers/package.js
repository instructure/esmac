const findUp = require('find-up')
const path = require('path')

module.exports = ({ captures, target, request }, {
  boundary = null,
  resolve = findNamedManifestOnDisk,
  expand = identity,
}, state) => {
  const [ pjsonFile, pjson ] = resolve(expand(target)) || []

  if (!pjsonFile) {
    return false
  }

  // when a boundary is specified, the package.json must be inside of it
  if (
    typeof boundary === 'number' &&
    path.basename(path.dirname(pjsonFile)) !== captures.target[boundary]
  ) {
    // console.warn('nope', pjsonFile, captures.target)
    return false
  }

  state.pjsonFile = pjsonFile
  state.pjson = pjson

  return request.startsWith(pjson.name)
}

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
