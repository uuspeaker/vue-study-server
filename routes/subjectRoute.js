const router = require('koa-router')()
const log = require('../util/log.js').getLogger("SubjectPool");
const SubjectManage = require('../service/paper/SubjectManage');

router.get('/subjectList', async (ctx, next) => {
  var subjectManage = new SubjectManage()
  var paperId = ctx.request.query.paperId
  var data = await subjectManage.getSubjectList(paperId)
  ctx.body = data
})

router.get('/subjectInfo', async (ctx, next) => {
  var subjectManage = new SubjectManage()
  var paperId = ctx.request.query.paperId
  var subjectId = ctx.request.query.subjectId
  var data = await subjectManage.getSubjectInfo(paperId,subjectId)
  ctx.body = data
})

module.exports = router
