var kafka = require('kafka-node');
const config = require('../config/db.js');
const log = require('../util/log.js').getLogger("kafka.js");

  Producer = kafka.Producer,
  client = new kafka.KafkaClient({
    kafkaHost: config.kafka.host
  }),
  producer = new Producer(client);

let payloads = [{
    topic: 'vue-study-topic',
    messages: 'kafka start at' + new Date(),
  }
];

producer.on('ready', function () {
  console.log('ready');
  // producer.send(payloads, function (err, data) {
  //   console.log(err, data);
  // });
});

producer.on('error', function (err) {
  console.log(err);
})

module.exports.send = function (topic, message, callback) {
  var aggregation = [{
    topic: topic,
    messages: message,
  }]
  producer.send(aggregation, function (err, result) {
    if (err) {
      log.error(`kafka send fail ${err}`)
      throw err
    }
    log.info(`kafka send message success, resutl is ${JSON.stringify(result)}`)
    callback(result)
  });
}
