var net      = require('net')
var http     = require('http')
var path     = require('path')
var express  = require('express')
var socketio = require('socket.io')
var mqttCon  = require('mqtt-connection')

var port = process.env.PORT || 8080

// setup express app
var app = express()
app.use(express.static(path.join(__dirname, 'public')))

// setup http server
var server = http.createServer(app)

// setup websockets server
var io = socketio(server)

io.on('connection', function (socket) {
  console.log('Client connected ' + socket.id)

  socket.on('color', function (color) {
    console.log('Received ' + color)
  })
})

// setup MQTT server
var mqttServer = net.createServer(function (stream) {
  var client = mqttCon(stream)
  var clients = {}

  client.on('connect', function (packet) {
    console.log('MQTT Client connected ' + packet.clientId)

    client.connack({ returnCode: 0 })
    client.id = packet.clientId
    clients[client.id] = client
  })

  client.on('pingreq', function (packet) {
    client.pingresp()
  })

  client.on('close', function (packet) {
    delete clients[client.id]
    console.log('MQTT Client closed connection ' + client.id)
  })

  client.on('disconnect', function (packet) {
    client.stream.end()
    console.log('MQTT Client disconnected ' + client.id)
  })

  client.on('error', function (packet) {
    if (!clients[client.id]) return

    delete clients[client.id]
    client.stream.end()
  })

})

// start servers
server.listen(port, function () {
  console.log('Server listening on port ' + port)
})

mqttServer.listen(1883, function () {
  console.log('MQTT Server is running')
})
