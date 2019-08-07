const config = {
 //启动端口
 port: 8080,
 //数据库配置
 mysql: {
   database: 'vue-study',
   user: 'vue',
   password: 'TianHan928',
   port: '3306',
   host: 'rm-wz98ecqcf1jvu5631uo.mysql.rds.aliyuncs.com'
 },
 mongo: {
   host: 'mongodb://study:123456@129.211.21.250:27017/study',
   database: ""
 },
 kafka: {
   host: '129.211.21.250:27017:9092',
 },
 cos: {
   secretId: 'AKIDNZXUCrbYXHnbZLwBGAp33oHWXlmaeZhc',
   secretKey: 'rcHjwymfM9nFSRAi28zdKm8FveQkfR4W',
   bucket : 'vue-study-1255824916',
   region : 'ap-shenzhen-fsi',
   maxKeys : 5
 },
 upload: {
   destination: 'upload',
   secretKey: 'rcHjwymfM9nFSRAi28zdKm8FveQkfR4W',
   bucket : 'vue-study-1255824916',
   region : 'ap-shenzhen-fsi'
 },
 ocr: {
   secretId: 'AKIDNZXUCrbYXHnbZLwBGAp33oHWXlmaeZhc',
   secretKey: 'rcHjwymfM9nFSRAi28zdKm8FveQkfR4W',
   host: "ocr.tencentcloudapi.com",
   zone: "ap-guangzhou"
 }

}
module.exports = config;
