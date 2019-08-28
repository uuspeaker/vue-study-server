const {ImageClient} = require('image-node-sdk');
const config = require('../config/db.js');
const log = require('../util/log.js').getLogger("ocr.js");
const util = require('util');
const fs = require('fs');

let AppId = config.ocr.appId; // 腾讯云 AppId
let SecretId = config.ocr.secretId; // 腾讯云 SecretId
let SecretKey = config.ocr.secretKey; // 腾讯云 SecretKey

let imgClient = new ImageClient({ AppId, SecretId, SecretKey });


module.exports.scanImageUrl =  (imageUrl) => {
  log.debug(`ocr图片识别开始: imageUrl ${imageUrl}`)
  let req = new models.GeneralBasicOCRRequest();
  let params = {ImageUrl:imageUrl}
  return new Promise(( resolve, reject ) => {
    imgClient.ocrIdCard({
    formData: {
        card_type: 0,
        image: fs.createReadStream(imageUrl)
    },
    headers: {
        'content-type': 'multipart/form-data'
    }
    }).then((result) => {
        resolve(result.body)
    }).catch((e) => {
        reject(e);
    });
  })
}
