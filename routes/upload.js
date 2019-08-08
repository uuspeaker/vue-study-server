const router = require('koa-router')()
const log = require('../util/log').getLogger("upload");
const multer = require('koa-multer');
const path = require('path');
const fs = require('fs');
const config = require('../config/db');
const data = require('../config/data');
const cos = require('../util/cos');
const mongo = require('../util/mongo');

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
    var result = await cos.putObject(file.path)

    var data = {userId: 11,fileName:file.filename, location: result.Location, createDate: new Date(), status: 1}
    ctx.body.result = result
    mongo.insertOne("exercise", data)

    ctx.body = {
      result: result
    }
  } else {
      ctx.body = 'upload error';
  }
});

router.get('/upload', async (ctx, next) => {
  log.debug("处理开始")
  ctx.body = {"result": 1};
  var result = await cos.getObjectList('')
  log.debug("处理结束");
  ctx.body.result = result
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
router.get('/data', async (ctx, next) => {
  ctx.body = data.result
  //ctx.body = 'exercise query success';
});

module.exports = router
