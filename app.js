const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const log = require('./util/log.js').getLogger("app.js");

const index = require('./routes/index')
const users = require('./routes/users')
const test = require('./routes/test')
const upload = require('./routes/upload')
//const cors = require('koa2-cors');

// error handler
onerror(app)

// app.use(cors({
//     origin: function (ctx) {
//         if (ctx.url === '/test') {
//             return "*"; // 允许来自所有域名请求
//         }
//         return 'http://localhost:8080'; / 这样就能只允许 http://localhost:8080 这个域名的请求了
//     },
//     exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
//     maxAge: 5,
//     credentials: true,
//     allowMethods: ['GET', 'POST','PUT', 'DELETE'],
//     allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
// }))

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

app.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', 'http://localhost');
  await next();
 });

// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())
app.use(test.routes(), users.allowedMethods())
app.use(upload.routes(), upload.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  log.error('server error', err, ctx)
});

module.exports = app
