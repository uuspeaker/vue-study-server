const gm = require('gm');
var fs = require('fs');
const log = require('../util/log.js').getLogger("graphic.js");

module.exports.cut = function (imageUrl, targetUrl, width, height, X, Y) {
  return new Promise(( resolve, reject ) => {
    gm(imageUrl).rotate('white',90).crop(width, height, X, Y).write(targetUrl,function(err, result){
      if(err){
        log.error("切图失败",err)
        reject(err)
      }else {
        log.info("切图成功",targetUrl)
        resolve(targetUrl)
      }
    });
  });
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

module.exports.orient = (oldPath, newPath) => {
  return new Promise(( resolve, reject ) => {
    gm(oldPath).noProfile().write(newPath, function (err) {
     if (!err) console.log('done');
  });
 });
}
