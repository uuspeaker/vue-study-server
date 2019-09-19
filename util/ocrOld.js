const {ImageClient} = require('image-node-sdk');
const config = require('../config/db.js');
const log = require('../util/log.js').getLogger("ocrOld.js");
const util = require('util');

let AppId = config.ocr.appId; // 腾讯云 AppId
let SecretId = config.ocr.secretId; // 腾讯云 SecretId
let SecretKey = config.ocr.secretKey; // 腾讯云 SecretKey

let imgClient = new ImageClient({ AppId, SecretId, SecretKey });


module.exports.scanImageUrl = async (imageUrl) => {
  log.debug(`ocr图片识别开始: imageUrl ${imageUrl}`)
  var data = await imgClient.ocrGeneral({data: {'url': imageUrl}})
  //log.debug('ocr识别结果', data)
  return data.body
}
