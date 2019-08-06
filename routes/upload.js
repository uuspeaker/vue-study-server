const router = require('koa-router')()
const log = require('../util/log.js').getLogger("upload.js");
const multer = require('koa-multer');
const path = require('path');
const config = require('../config/db.js');

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
  log.debug("get into upload",ctx.req.file)
    if (ctx.req.file){
        ctx.body = 'upload success';
    } else {
        ctx.body = 'upload error';
    }
});

module.exports = router
