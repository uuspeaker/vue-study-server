const router = require('koa-router')()
const log = require('../util/log.js').getLogger("SubjectPool");
const SubjectManage = require('../service/paper/SubjectManage');
const subjectManage = new SubjectManage()

router.get('/subjectList', async (ctx, next) => {
  var paperId = ctx.request.query.paperId
  var data = await subjectManage.getSubjectList(paperId)
  ctx.body = data
})

router.get('/subjectInfo', async (ctx, next) => {
  var subjectId = ctx.request.query.subjectId
  var data = await subjectManage.getSubjectInfo(subjectId)
  ctx.body = data
})
router.put('/checkSubject', async (ctx, next) => {
  var subjectId = ctx.request.body.subjectId
  var isRight = ctx.request.body.isRight
  var data = await subjectManage.checkSubject(subjectId,isRight)
  ctx.body = data
})

router.post('/commentSubject', async (ctx, next) => {
  var subjectId = ctx.request.body.subjectId
  var commentText = ctx.request.body.commentText
  var commentAudioUrl = ctx.request.body.commentAudioUrl
  var knowledge = ctx.request.body.knowledge
  var data = subjectManage.commentSubject(subjectId, commentText, commentAudioUrl,knowledge)
  ctx.body = data
});

module.exports = router
