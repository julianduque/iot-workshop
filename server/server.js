var http    = require('http')
var path    = require('path')
var express = require('express')

var port = process.env.PORT || 8080

// setup express app
var app = express()
app.use(express.static(path.join(__dirname, 'public')))

// setup http server
var server = http.createServer(app)

server.listen(port, function () {
  console.log('Server listening on port ' + port)
})
