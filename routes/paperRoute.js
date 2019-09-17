const router = require('koa-router')()
const log = require('../util/log.js').getLogger("SubjectPool");
const PaperManage = require('../service/paper/PaperManage');
const paperManage = new PaperManage()

router.get('/paperList', async (ctx, next) => {
  var userId = '123'
  var data = await paperManage.getPaperList(userId)
  ctx.body = data
});

router.get('/paperInfo', async (ctx, next) => {
  var paperId = ctx.request.query.paperId
  var data = await paperManage.getPaperInfo(paperId)
  ctx.body = data
})

router.get('/subjectInfo', async (ctx, next) => {
  var paperId = ctx.request.query.paperId
  var subjectId = ctx.request.query.subjectId
  var data = await paperManage.getSubjectInfo(paperId,subjectId)
  ctx.body = data
})
router.put('/checkSubject', async (ctx, next) => {
  var paperId = ctx.request.body.paperId
  var subjectId = ctx.request.body.subjectId
  var answer = ctx.request.body.answer
  var data = await paperManage.checkSubject(paperId,subjectId,answer)
  ctx.body = data
})

router.delete('/paperInfo', async (ctx, next) => {
  var id = ctx.request.body.id
  var data = await paperManage.deletePaper(id)
  ctx.body = data
});

router.post('/commentSubject', async (ctx, next) => {
  var paperId = ctx.request.body.paperId
  var subjectId = ctx.request.body.subjectId
  var commentText = ctx.request.body.commentText
  var commentAudioUrl = ctx.request.body.commentAudioUrl
  var data = paperManage.commentSubject(paperId, subjectId, commentText, commentAudioUrl)
  ctx.body = data
});

module.exports = router
