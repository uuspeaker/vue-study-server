const router = require('koa-router')()
const stringify = require('node-stringify');
const log      = require('../util/log.js');
const mongo = require('../util/mongo.js');
const mysql = require('../util/mysql.js');
const kafka = require('../util/kafka.js');


router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Hello Koa 3!'
  })
})

router.get('/mysql', async (ctx, next) => {
  let sql = "select * from user";
  let data = {};
  await mysql.execute(sql,data, function(res) {

  })
  ctx.body = {
    title: `Hello mysql`
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
 
router.get('/json', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 json'
  }
})

module.exports = router
