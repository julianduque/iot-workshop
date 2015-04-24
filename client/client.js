var mqtt = require('mqtt')
var five = require('johnny-five')

var board = new five.Board()

board.on('ready', function () {
  var client = mqtt.connect()
  client.subscribe('colors')

  client.on('message', function (topic, payload) {
    console.log('Received ' + payload + ' sent to ' + topic)
  })

})
