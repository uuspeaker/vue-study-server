const router = require('koa-router')()
const log = require('../util/log').getLogger("upload");
const multer = require('koa-multer');
const path = require('path');
const fs = require('fs');
const config = require('../config/db');
const data = require('../config/data');
const cos = require('../util/cos');
const mongo = require('../util/mongo');
const ocr = require('../util/ocr.js');
const TestPaper = require('../service/studyAnalyse/TestPaper');

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
  var file = ctx.req.file
  if (file){
    var result = await cos.putObject(file.path)
    log.debug("上传文件开始，临时文件保存在：file.path",file.path)
    var ocrResult = await ocr.scanImageUrl("https://" + result.Location)
    log.debug("文件ocr扫描结果为",ocrResult)
    var testPaper = new TestPaper(file.path,ocrResult)
    await testPaper.init()
    var testPaperInfo = {
      userId: 123,
      subjects: testPaper.getSubjectInfos()
    }
    mongo.insertOne("TestPaper", testPaperInfo)
    ctx.body = testPaperInfo

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


router.get('/testPaper', async (ctx, next) => {
  var data = await mongo.find("TestPaper",{})
  ctx.body = data
  log.info('testPaper query complete')
});

router.get('/data', async (ctx, next) => {
  ctx.body = data.result
  //ctx.body = 'exercise query success';
});

module.exports = router
