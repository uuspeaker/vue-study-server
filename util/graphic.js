const gm = require('gm');
var fs = require('fs');
const log = require('../util/log.js').getLogger("graphic.js");

module.exports.cut = function (imageUrl, targetUrl, leftX, leftY, rightX, rightY) {
  return new Promise(( resolve, reject ) => {
    gm(imageUrl).crop(leftX, leftY, rightX, rightY).write(targetUrl,function(err, result){
      if(err){
        log.error("切图失败",err)
        reject(err)
      }else {
        log.info("切图成功",targetUrl)
        resolve(targetUrl)
      }
    });
  })
//   return new Promise(( resolve, reject ) => {
//     gm(__dirname + '/mathPaper.png').crop(leftX, leftY, rightX, rightY).write(targetUrl,function(err, result){
//       if(err){
//         log.error("剪切图片失败",err)
//         reject(err)
//       }else {
//         log.info("剪切图片成功",targetUrl)
//         resolve()
//       }
//     });
//   })
}

module.exports.combine = (url1, url2, targetUrl) => {
  return new Promise(( resolve, reject ) => {
    gm(url1).append(url2).adjoin().write(targetUrl, function(result, err) {
      if(err){
        log.error("合并图片失败",err)
        reject(err)
      }else {
        log.info("合并图片成功",targetUrl)
        resolve(targetUrl)
      }
   });
 });
}
