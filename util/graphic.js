const gm = require('gm');
var fs = require('fs');
const log = require('../util/log.js').getLogger("graphic.js");
const ExifImage =require('exif').ExifImage

module.exports.saveOrient = async (imageUrl, targetUrl) => {
  var rotateDegree = await rotate(imageUrl)
  return new Promise(( resolve, reject ) => {
    gm(imageUrl).rotate('white',rotateDegree).write(targetUrl,function(err, result){
      if(err){
        log.error("旋转图片失败",err)
        reject(err)
      }else {
        log.info("旋转图片成功",targetUrl)
        resolve(targetUrl)
      }
    });
  });
}

module.exports.cut = async (imageUrl, targetUrl, width, height, X, Y) => {
  //var rotateDegree = await rotate(imageUrl)
  return new Promise(( resolve, reject ) => {
    gm(imageUrl).crop(width, height, X, Y).write(targetUrl,function(err, result){
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

module.exports.combine = async (url1, url2, targetUrl) => {
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

rotate = async (imageUrl) => {
  return new Promise(( resolve, reject ) => {
    new ExifImage({ image :imageUrl }, function (err, exifData) {
     if (err){
       log.error("读取图片exif信息失败",err)
       resolve(0)
     }else{
       log.info("读取图片exif信息",exifData)
       var orientation = exifData.image.Orientation
       var degreeArr = [0,0,0,180,0,0,90,0,270,0]
       resolve(degreeArr[orientation])
     }
   })
  })
}
