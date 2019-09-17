const router = require('koa-router')()
const log = require('../util/log.js').getLogger("SubjectPool");
const PaperManage = require('../service/paper/PaperManage');

router.get('/paperList', async (ctx, next) => {
  var userId = '123'
  var data = await paperManage.getPaperList(userId)
  ctx.body = data
});

router.get('/paperInfo', async (ctx, next) => {
  var paperManage = new PaperManage()
  var paperId = ctx.request.query.paperId
  var data = await paperManage.getSubjectList(paperId)
  ctx.body = data
})

router.get('/subjectInfo', async (ctx, next) => {
  var paperManage = new PaperManage()
  var paperId = ctx.request.query.paperId
  var subjectId = ctx.request.query.subjectId
  var data = await paperManage.getSubjectInfo(paperId,subjectId)
  ctx.body = data
})

router.delete('/testPaper', async (ctx, next) => {
  var paperManage = new PaperManage()
  var id = ctx.request.body.id
  var data = await paperManage.deletePaper(id)
  ctx.body = data
});

module.exports = router
