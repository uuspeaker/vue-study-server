const gm = require('gm');
var fs = require('fs');
const log = require('../util/log.js').getLogger("graphic.js");

module.exports.cutImage = function (imageUrl, left, right) {
  gm(__dirname +"/start.jpg").crop(100,100,200,200).write(__dirname + "/2.png",function(err, result){
    if(err){
      log.error("剪切图片失败",err)
    }else {
      log.info("剪切图片成功",result)
    }
  });

}
