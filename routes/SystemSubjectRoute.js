const router = require('koa-router')()
const log = require('../util/log.js').getLogger("SubjectPool");
const KnowledgeTree = require('../service/subjectPool/KnowledgeTree');
const SubjectFinder = require('../service/subjectPool/SubjectFinder');
const SubjectLoader = require('../service/subjectPool/SubjectLoader');
const SubjectOrganiser = require('../service/subjectPool/SubjectOrganiser');

router.get('/subjectOfKnowledge', async (ctx, next) => {
  var finder = new SubjectFinder()
  var data = await finder.querySubjects(ctx.request.query.knowledgeId)
  ctx.body = data
})

router.get('/loadSystemSubject', async (ctx, next) => {
  var loader = new SubjectLoader()
  var data = await loader.load()
  ctx.body = data
})

router.get('/deleteSystemSubject', async (ctx, next) => {
  var loader = new SubjectLoader()
  var data = await loader.deleteAll()
  ctx.body = data
})

router.post('/subjectBasket', async (ctx, next) => {
  var organiser = new SubjectOrganiser()
  var userId = '123'
  var subjectId = ctx.request.body.subjectId
  var data = await organiser.add(userId, subjectId)
  ctx.body = data
})
router.get('/subjectBasket', async (ctx, next) => {
  var organiser = new SubjectOrganiser()
  var userId = '123'
  var data = await organiser.getSubjects(userId)
  ctx.body = data
})
router.put('/subjectBasket', async (ctx, next) => {
  var organiser = new SubjectOrganiser()
  var userId = '123'
  var subjectId = ctx.request.body.subjectId
  var data = await organiser.remove(userId, subjectId)
  ctx.body = data
})


module.exports = router
