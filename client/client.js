var mqtt = require('mqtt')
var five = require('johnny-five')

var board = new five.Board()

board.on('ready', function () {
  var client = mqtt.connect()
  client.subscribe('colors')

  var led = new five.Led.RGB({
    pins: {
      red: 'A6',
      green: 'A9',
      blue: 'A10'
    }
  })

  client.on('message', function (topic, payload) {
    console.log('Received ' + payload + ' sent to ' + topic)

    if (topic === 'colors') {
      var color = payload.toString()
      led.color(color)
    }
  })

})
