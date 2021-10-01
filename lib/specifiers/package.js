const findUp = require('find-up')
const path = require('path')

module.exports = ({ context, target, request }, { resolve = resolveFromDisk }, state) => {
  const manifestDetails = resolve(target, context)

  if (!manifestDetails) {
    return false
  }

  const [ manifestPath, manifest ] = manifestDetails

  state.manifestPath = manifestPath
  state.manifest = manifest

  return request.startsWith(manifest.name)
}

const resolveFromDisk = (file, context) => {
  try {
    const manifestFile = findUp.sync('package.json', { cwd: path.join(context, path.dirname(file)) })
    return [manifestFile, require(manifestFile)]
  }
  catch (_e) {
    return null
  }
}