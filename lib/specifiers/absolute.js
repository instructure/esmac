module.exports = ({ request }) => schemeless(request).startsWith('/')
const schemeless = x => x.replace(/^\w+:\/\//, '')
