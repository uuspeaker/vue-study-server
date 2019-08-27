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


module.exports = router
