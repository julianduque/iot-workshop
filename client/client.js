var mqtt = require('mqtt')

var client = mqtt.connect()

client.subscribe('colors')

client.on('message', function (topic, payload) {
  console.log('Received ' + payload + ' sent to ' + topic)
})
