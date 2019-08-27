const router = require('koa-router')()
const log = require('../util/log.js').getLogger("SubjectPool");
const KnowledgeTree = require('../service/subjectPool/KnowledgeTree');
const SubjectFinder = require('../service/subjectPool/SubjectFinder');

router.get('/knowledgeTree', async (ctx, next) => {
  var tree = new KnowledgeTree()
  var data = await tree.getAll()
  ctx.body = data
})

router.get('/knowledgeChildren', async (ctx, next) => {
  var tree = new KnowledgeTree()
  var data = await tree.getChildren(ctx.request.query.knowledgeId)
  ctx.body = data
})

router.get('/subjectList', async (ctx, next) => {
  var finder = new SubjectFinder()
  var data = await finder.querySubjects(ctx.request.query.knowledgeId)
  ctx.body = data
})


module.exports = router