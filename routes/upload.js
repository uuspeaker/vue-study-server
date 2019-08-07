const router = require('koa-router')()
const log = require('../util/log.js').getLogger("upload.js");
const multer = require('koa-multer');
const path = require('path');
const fs = require('fs');
const config = require('../config/db.js');
const cos = require('../util/cos.js');
const mongo = require('../util/mongo.js');
var COS = require('cos-nodejs-sdk-v5');

var cos1= new COS({
    SecretId: config.cos.secretId,
    SecretKey: config.cos.secretKey
});

let storage = multer.diskStorage({
    destination: path.resolve(config.upload.destination),
    filename: (ctx, file, cb)=>{
        cb(null, file.originalname);
    }
});

let fileFilter = (ctx, file ,cb)=>{
//过滤上传的后缀为txt的文件
    if (file.originalname.split('.').splice(-1) == 'txt'){
        cb(null, false);
    }else {
        cb(null, true);
    }
}

let upload = multer({ storage: storage, fileFilter: fileFilter });

router.post('/upload', upload.single('file'), async (ctx, next) => {
  log.debug("处理开始")
  var file = ctx.req.file
  ctx.body = {"result": 1};
  var result =1
  if (file){
    await cos.putObject(file.path, (result) => {
      log.debug("回调开始");
      var data = {userId: 11,fileName:file.filename, location: result.Location, createDate: new Date(), status: 1}
      ctx.body.result = result
      //mongo.insertOne("exercise", data, () => {})
      log.debug("回调结束", result);
    })
    log.debug("处理结束");
    ctx.body.time = new Date()
  } else {
      ctx.body = 'upload error';
  }
});

router.get('/upload', async (ctx, next) => {
  log.debug("处理开始")
  ctx.body = {"result": 1};
  await cos.getObjectList('', (result) => {
    log.debug("回调开始");
    ctx.body.result = result
    //mongo.insertOne("exercise", data, () => {})
    log.debug("回调结束");
  })
  log.debug("处理结束");
  ctx.body.time = new Date()
});

router.get('/upload2', async (ctx, next) => {
  log.debug("处理开始")

  await cos1.getBucket({
    Bucket: config.cos.bucket,
    Region: config.cos.region,
    Prefix: '', // 这里传入列出的文件前缀
    MaxKeys: config.cos.maxKeys,
  }, (err, data) => {
    if (err) {
      log.error("查询文件异常",err)
      throw err
    }
    log.debug("处理结束,data", data);
    ctx.body = {
      'result': data.Contents
    }
  });
});

router.get('/exercise', async (ctx, next) => {
  var data = {}
  await mongo.find("exercise",{}, async (result) => {
    log.debug('/exercise',result)
    ctx.body = {"result": result};
  })
  //ctx.body = 'exercise query success';
});

module.exports = router
