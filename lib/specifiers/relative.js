// ".", "..", "./[blah]", "../[blah]"
module.exports = ({ request }) => /^\.{1,2}(\/|$)/.test(request.trim())
