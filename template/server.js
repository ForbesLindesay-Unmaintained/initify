'use strict'

var browserify = require('browserify-middleware')
var express = require('express')
var app = express()

app.use(express.favicon(__dirname + '/favicon.ico'))

app.listen(3000)
console.log('listening on http://localhost:3000')