const absolute = require('./absolute')
const relative = require('./relative')

module.exports = params => !absolute(params) && !relative(params) && !params.request.startsWith('#')

