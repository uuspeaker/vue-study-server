const router = require('koa-router')()
const log = require('../util/log.js').getLogger("index.js");
const mongo = require('../util/mongo.js');
const mysql = require('../util/mysql.js');
const kafka = require('../util/kafka.js');
const ocr = require('../util/ocr.js');
const cos = require('../util/cos.js');


router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Hello Koa 3!'
  })
})

router.get('/mysql', async (ctx, next) => {
  let sql = "select * from user";
  let data = {};
  var result = {}
  await mysql.execute(sql,data, function(res) {
    result = res
  })
  ctx.body = {
    "result": result
  }

})

router.get('/mongo', async (ctx, next) => {
  var myobj = { name: "菜鸟教程4", url: "www.runoob",date: new Date() };
  await mongo.insertOne("study",myobj, function(res) {
      log.info(`文档插入成功 ${res}`);
  })
  ctx.body = {
    title: `Hello ${myobj.name}`
  }
})

router.get('/kafka', async (ctx, next) => {
  await kafka.send("study","I will study", function(res) {
  })
  ctx.body = {
    title: `Hello kafka`
  }
})

router.get('/cos', async (ctx, next) => {
  await cos.putObject("config.js", function(res) {
  })
  ctx.body = {
    title: `Hello cos`
  }
})

router.get('/ocr', async (ctx, next) => {
  await ocr.scanImageUrl("https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1565072083218&di=ed2f5d1953192575bf938babeb2a7e03&imgtype=0&src=http%3A%2F%2Ftxt6.book118.com%2F2017%2F0104%2Fbook79189%2F79188616.png",(response) => {
    ctx.body = {
      result: response
    }
  })
})

router.get('/json', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 json'
  }
})

module.exports = router
