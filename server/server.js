var net          = require('net')
var http         = require('http')
var path         = require('path')
var express      = require('express')
var socketio     = require('socket.io')
var mqttCon      = require('mqtt-connection')
var EventEmitter = require('events').EventEmitter

var port = process.env.PORT || 8080

// events
var events = new EventEmitter()

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
    events.emit('mqtt:broadcast', 'colors', color)
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

  client.on('subscribe', function (packet) {
    var granted = []

    for (var i = 0; i < packet.subscriptions.length; i++) {
      var subscription = packet.subscriptions[i]
      console.log('MQTT Client ' + client.id + ' subscribed to ' + subscription.topic)
      granted.push(subscription.qos)
    }

    client.suback({ granted: granted, messageId: packet.messageId })
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

  events.on('mqtt:broadcast', function (topic, payload) {
    var clientIds = Object.keys(clients)

    clientIds.forEach(function (id) {
      clients[id].publish({ topic: topic, payload: payload })
    })
  })

})

// start servers
server.listen(port, function () {
  console.log('Server listening on port ' + port)
})

mqttServer.listen(1883, function () {
  console.log('MQTT Server is running')
})
