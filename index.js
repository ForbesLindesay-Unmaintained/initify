var path = require('path')
var fs = require('fs')
var Q = require('q')
var discern = require('discern')
var read = Q.denodeify(require('read'))

var settings = require('./settings.json')

var dir = process.cwd()
var github = discern.github(discern.folder.sync(dir))


var ready = Q(null)

var options = settings
options.name = (github && github[0]) || path.basename(dir)
options.year = (new Date).getFullYear()

prompt('type', '0', '(0: library, 1: command line app, 2: static website, 3: dynamic website)')
if (github && github[0]) options.user = github[0]
else prompt('user', settings.user)
prompt('description', '')

function prompt(name, defaultVal, info) {
  ready = ready.then(function () {
    return read({
      prompt: name + (info ? ' ' + info : '') + ':',
      default: defaultVal
    })
    .spread(function (res) {
      options[name] = res
    })
  })
}

ready.done(function () {
  var ignore = [
    'lib-cov',
    '*.seed',
    '*.log',
    '*.csv',
    '*.dat',
    '*.out',
    '*.pid',
    '*.gz',
    'pids',
    'logs',
    'results',
    'npm-debug.log',
    'node_modules'
  ]
  if (options.type == '2') { //static website
    ignore.push('out')
    ignore.push('.mandate.toml')
  }
  write('.gitignore', ignore.join('\n') + '\n')

  template('LICENSE')
  template('.travis.yml')

  switch (options.type) {
    case '0': //library
      template('package-library.json', 'package.json')
      write('index.js', "'use strict'")
      template('README.md')
      break;
    case '1': //command line app
      template('package-cli.json', 'package.json')
      try { fs.mkdirSync('bin') } catch (ex) {}
      write('index.js', "'use strict'")
      write('bin/cli.js', '#!/usr/bin/env node\n\n\'use strict\'\n\nvar ' + options.name.replace(/[^a-z0-9A-Z]+/g, '') + ' = require(\'../\')')
      template('README.md')
      break;
    case '2': //static website
      template('package-static.json', 'package.json')
      template('server.js', 'server.js')
      template('README-website.md', 'README.md')
      break;
    case '3': //dynamic website
      template('package-server.json', 'package.json')
      template('server.js', 'server.js')
      template('README-website.md', 'README.md')
      break;
  }
})
function template(source, destination) {
  var src = fs.readFileSync(__dirname + '/template/' + source, 'utf8')
  var dest = src.replace(/\<\{([^\}\>]+)\}\>/g, function (_, name) {
    return options[name]
  })
  if (!fs.existsSync(destination || source)) {
    fs.writeFileSync(destination || source, dest)
  } else {
    ready = ready.then(function () {
      return read({
        prompt: 'overwrite ' + (destination || source) + '?',
        default: 'no'
      })
      .spread(function (res) {
        if (res === 'y' || res === 'ye' || res === 'yes') {
          fs.writeFileSync(destination || source, dest)
        }
      })
    })
  }
}
function write(path, content) {
  if (!fs.existsSync(path)) {
    fs.writeFileSync(path, content)
  } else {
    ready = ready.then(function () {
      return read({
        prompt: 'overwrite ' + path + '?',
        default: 'no'
      })
      .spread(function (res) {
        if (res === 'y' || res === 'ye' || res === 'yes') {
          fs.writeFileSync(path, content)
        }
      })
    })
  }
}
