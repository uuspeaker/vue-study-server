const router = require('koa-router')()
const log = require('../util/log.js').getLogger("SubjectPool");
const SubjectManage = require('../service/paper/SubjectManage');

router.get('/subjectInfo', async (ctx, next) => {
  var subjectManage = new SubjectManage()
  var paperId = ctx.request.query.paperId
  var data = await subjectManage.getSubjectsOfPaper(paperId)
  ctx.body = data
})

module.exports = router