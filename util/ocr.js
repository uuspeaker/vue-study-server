const tencentcloud = require("tencentcloud-sdk-nodejs");
const config = require('../config/db.js');
const log = require('../util/log.js').getLogger("ocr.js");

const OcrClient = tencentcloud.ocr.v20181119.Client;
const models = tencentcloud.ocr.v20181119.Models;

const Credential = tencentcloud.common.Credential;
const ClientProfile = tencentcloud.common.ClientProfile;
const HttpProfile = tencentcloud.common.HttpProfile;

let cred = new Credential(config.ocr.secretId, config.ocr.secretKey);
let httpProfile = new HttpProfile();
httpProfile.endpoint = config.ocr.host;
let clientProfile = new ClientProfile();
clientProfile.httpProfile = httpProfile;
const client = new OcrClient(cred,  config.ocr.zone, clientProfile);

module.exports.scanImageUrl =  (imageUrl) => {
  log.info(`ocr.scanImageUrl.input: imageUrl is ${imageUrl}`)
  let req = new models.GeneralBasicOCRRequest();
  let params = {ImageUrl:imageUrl}
  req.from_json_string(JSON.stringify(params));
  log.info(`ocr.scanImageUrl: params is ${JSON.stringify(params)}`)
  return new Promise(( resolve, reject ) => {
    client.GeneralBasicOCR(req, function(errMsg, response) {
        if (errMsg) {
            log.error(errMsg);
            reject(err)
        }else{
          log.info(`ocr.scanImageUrl.output: response is ${JSON.stringify(response)}`)
          resolve(response)
        }

    });
  })

}
