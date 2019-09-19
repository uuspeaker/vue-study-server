const router = require('koa-router')()
const log = require('../util/log.js').getLogger("SubjectPool");
const PaperManage = require('../service/paper/PaperManage');
const paperManage = new PaperManage()
const multer = require('koa-multer');

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

router.post('/paperInfo', upload.single('file'), async (ctx, next) => {
  var file = ctx.req.file
  var userId = '123'
  var paperInfo = await paperManage.analysePaper(userId, file)
  ctx.body = paperInfo
});

router.get('/paperList', async (ctx, next) => {
  var userId = '123'
  var data = await paperManage.getPaperList(userId)
  ctx.body = data
});

router.get('/paperInfo', async (ctx, next) => {
  var paperId = ctx.request.query.paperId
  var data = await paperManage.getPaperInfo(paperId)
  ctx.body = data
});

router.delete('/paperInfo', async (ctx, next) => {
  var id = ctx.request.body.id
  var data = await paperManage.deletePaper(id)
  ctx.body = data
});


module.exports = router
