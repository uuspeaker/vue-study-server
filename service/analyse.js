const log = require('../util/log').getLogger("analyse");

module.exports.extractNo = (subjects) => {
  var result = []
  for (var i = 0; i < subjects.length; i++) {
    var item = subjects[i].DetectedText
    log.debug("开始解析",item)

    var regExp = /^\d+/;
		var mathResult = item.match(regExp);
		if(mathResult) {
			subjects[i].sortNo = mathResult[0]*1
      result.push(subjects[i])
		}else{

    }
  }
  var returnData = result.sort((a,b) => {
    return a.sortNo - b.sortNo
  })
  log.debug("有效数据",result)
  return result
}
