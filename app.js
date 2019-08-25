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
const users = require('./routes/users')
const test = require('./routes/test')
const upload = require('./routes/upload')
const data = require('./routes/data')
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
app.use(users.routes(), users.allowedMethods())
app.use(test.routes(), users.allowedMethods())
app.use(upload.routes(), upload.allowedMethods())
app.use(data.routes(), data.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  log.error('server error', err, ctx)
});

module.exports = app
