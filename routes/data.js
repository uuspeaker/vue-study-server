const router = require('koa-router')()
const log = require('../util/log.js').getLogger("data");
const graphic = require('../util/graphic.js')
const data = require('../config/data');
const analyze = require('../service/analyse');

router.get('/cut', async (ctx, next) => {
  log.debug("开始解析ocr结果")

  var subjects = data.result.TextDetections
  //log.debug("完整数据subjects",subjects)
  var validSubject = analyze.extractNo(subjects)

    //var line = JSON.parse(subject.AdvancedInfo).Parag.ParagNo
  ctx.body = validSubject
})

router.get('/image', async (ctx, next) => {
  log.debug("开始剪裁图片")

  var validSubject = graphic.cutImage()

    //var line = JSON.parse(subject.AdvancedInfo).Parag.ParagNo
  ctx.body = {result:1}
})





module.exports = router
