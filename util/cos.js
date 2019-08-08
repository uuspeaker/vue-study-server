var COS = require('cos-nodejs-sdk-v5');
const log = require('../util/log.js').getLogger("cos.js");
const uuid = require('node-uuid');
const fs = require('fs');
const path = require('path');
const util = require('util');
const config = require('../config/db.js')

var cos = new COS({
    SecretId: config.cos.secretId,
    SecretKey: config.cos.secretKey
});
cos.getBucketPromisify = util.promisify(cos.getBucket);

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

module.exports.putObject = (location) => {
  log.debug("上传文件开始,locaton", location);
  var key = uuid.v1() + path.extname(location)
  return new Promise(( resolve, reject ) => {
    cos.sliceUploadFile({
      Bucket: config.cos.bucket,
      Region: config.cos.region,
      Key: key,
      //Body: "hello", // 这
      FilePath: location,
      //Body: fs.createReadStream(path), // 这
      onProgress: (progressData) => {
        log.info(JSON.stringify(progressData));
      }
    }, (err, data) => {
      if (err) {
        log.error("上传文件异常",err)
        reject(err)
      }
      log.debug("上传文件结束,data", data);
      resolve(data)
    });
  })
}

module.exports.getObjectList = async (conditon) => {
  log.debug("查询文件开始,conditon", conditon);
  const data = await cos.getBucketPromisify({
    Bucket: config.cos.bucket,
    Region: config.cos.region,
    Prefix: conditon, // 这里传入列出的文件前缀
    MaxKeys: config.cos.maxKeys,
  });
  log.debug("查询文件结束,conditon", data);
  return data

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
