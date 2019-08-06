const router = require('koa-router')()
const log = require('../util/log.js').getLogger("upload.js");
const multer = require('koa-multer');
const path = require('path');
const fs = require('fs');
const config = require('../config/db.js');
const cos = require('../util/cos.js');
const mongo = require('../util/mongo.js');

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
  log.debug("get into upload",file)
    if (file){
      await cos.putObject(file.path, (result) => {
        var data = {userId: 11,fileName:file.filename, location: result.Location, createDate: new Date(), status: 1}
        mongo.insertOne("exercise", data, () => {})
      })

      ctx.body = 'upload success';
    } else {
        ctx.body = 'upload error';
    }
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
