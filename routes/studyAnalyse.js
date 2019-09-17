const router = require('koa-router')()
const log = require('../util/log').getLogger("upload");
const multer = require('koa-multer');
const path = require('path');
const fs = require('fs');
const config = require('../config/db');
const data = require('../config/data');
const cos = require('../util/cos');
const mongo = require('../util/mongo');
const graphic = require('../util/graphic');
const ocr = require('../util/ocrOld');
const TestPaper = require('../service/studyAnalyse2/TestPaper');
const PaperManage = require('../service/paper/PaperManage');

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

    log.debug("上传文件开始，临时文件保存在：file.path",file.path)
    var dirName = path.dirname(file.path);
    var extname = path.extname(file.path);
    var fileName = path.basename(file.path, extname);
    var cosFilePath = dirName +'\\'+ fileName + '-cos' + extname
    await graphic.saveOrient(file.path,cosFilePath)
    log.debug("将图片调整成正确方向并保存",cosFilePath)
    var result = await cos.putObject(file.path)

    log.debug('cosFile',cosFilePath)
    var ocrResult = await ocr.scanImageUrl("https://" + result.Location)
    log.debug("文件ocr扫描结果为",ocrResult)
    var testPaper = new TestPaper(cosFilePath, JSON.parse(ocrResult).data.items)
    await testPaper.init()
    var testPaperInfo = {
      userId: 123,
      paperName: fileName,
      paperUrl: "https://" + result.Location,
      subjects: testPaper.getSubjectInfos(),
      createData: new Date()
    }
    mongo.insertOne("TestPaper", testPaperInfo)
    ctx.body = testPaperInfo

  } else {
      ctx.body = 'upload error';
  }
});

router.post('/uploadFile', upload.single('file'), async (ctx, next) => {
  var file = ctx.req.file
  if (file){
    log.debug("上传文件开始，临时文件保存在：file.path",file.path)
    var result = await cos.putObject(file.path)
    ctx.body = result.Location;
  } else {
      ctx.body = 'upload error';
  }
});




module.exports = router
