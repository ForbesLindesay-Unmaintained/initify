var fs = require('fs')
var Q = require('q')
var r = Q.denodeify(require('read'))

var settings = {}
var ready = Q(null)

function read(name, description) {
  return ready = ready.then(function () {
    return r({
      prompt: 'Enter a value for "' + name + '" (' + description + '):',
      timeout: 20000
    }).get(0)
  })
  .then(function (res) {
    settings[name] = res
  })
}
function write(name) {
  return ready = ready.then(function () {
    console.dir(settings)
    fs.writeFileSync(name, JSON.stringify(settings, null, '  '))
  })
}

var settings = {}

read('author', 'the value used for the "author" package.json field')
read('copyHolder', 'the value used for the copyright notice in "LICENSE" files')
read('user', 'the default GitHub user used for urls like travis-ci, gemnasium etc.')
write(__dirname + '/settings.json')