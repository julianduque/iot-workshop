var mqtt = require('mqtt')

var client = mqtt.connect()

client.subscribe('colors')
