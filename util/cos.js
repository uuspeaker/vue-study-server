var COS = require('cos-nodejs-sdk-v5');
const log = require('../util/log.js').getLogger("cos.js");
const uuid = require('node-uuid');
const config = require('../config/db.js')

var cos = new COS({
    SecretId: config.cos.secretId,
    SecretKey: config.cos.secretKey
});

module.exports.getObjectUrl = (key) => {
    var url = cos.getObjectUrl({
        Bucket: config.cos.bucket, // Bucket 格式：test-1250000000
        Region: config.cos.region,
        Key: key,
        Expires: 60,
        Sign: true,
    }, function (err, data) {
        if (err) {
          log.error(`cos get object url fail ${err}`)
          throw err
        }
        log.info(data);
    });
    return url
}

module.exports.putObject = (body, callback) => {
  var key = uuid.v1()
  cos.putObject({
    Bucket: config.cos.bucket,
    Region: config.cos.region,
    Key: "config.js",
    //Body: "hello", // 这
    Body: body, // 这
    onProgress: function(progressData) {
      log.info(JSON.stringify(progressData));
    }
  }, function (err, data) {
    if (err) {
      log.error(`cos put object fail ${err}`)
      throw err
    }
    log.info("putObject success",data);
    callback(data)
  });
}

module.exports.getObjectList = () => {
  cos.getBucket({
    Bucket: config.cos.bucket,
    Region: config.cos.region,
    Prefix: '/', // 这里传入列出的文件前缀
  }, function (err, data) {
      console.log(err || data.Contents);
  });
}

module.exports.deleteObject = (key) => {
  cos.deleteObject({
    Bucket: config.cos.bucket,
    Region: config.cos.region,
    Key: key,
  }, function (err, data) {
    if (err) {
      log.error(`cos delete object fail ${err}`)
      throw err
    }
    log.info(data);
  });
}
