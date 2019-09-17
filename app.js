const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const cors = require('koa2-cors')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const log = require('./util/log.js').getLogger("app.js");

const index = require('./routes/index')
const studyAnalyse = require('./routes/studyAnalyse')
const subjectPool = require('./routes/subjectPool')
const paperRoute = require('./routes/paperRoute')
//const cors = require('koa2-cors');

// error handler
onerror(app)

app.use(cors())

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  log.info(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(index.routes(), index.allowedMethods())
app.use(studyAnalyse.routes(), studyAnalyse.allowedMethods())
app.use(subjectPool.routes(), subjectPool.allowedMethods())
app.use(paperRoute.routes(), paperRoute.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  log.error('server error', err, ctx)
});

module.exports = app
