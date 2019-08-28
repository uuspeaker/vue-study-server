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
   host: 'mongodb://vue_study:123456@129.211.21.250:27017/vue_study',
   database: ""
 },
 kafka: {
   host: '129.211.21.250:27017:9092',
 },
 cos: {
   secretId: 'AKIDNZXUCrbYXHnbZLwBGAp33oHWXlmaeZhc',
   secretKey: 'rcHjwymfM9nFSRAi28zdKm8FveQkfR4W',
   bucket : 'vue-1255824916',
   region : 'ap-guangzhou',
   maxKeys : 5
 },
 upload: {
   destination: 'upload'
 },
 ocr: {
   appId: '1255824916',
   secretId: 'AKIDNZXUCrbYXHnbZLwBGAp33oHWXlmaeZhc',
   secretKey: 'rcHjwymfM9nFSRAi28zdKm8FveQkfR4W',
   host: "ocr.tencentcloudapi.com",
   //hostOld: "recognition.image.myqcloud.com",
   zone: "ap-guangzhou"
 },
 mongodb: {
    "user": "study",
    "pass": "123456",
    "host": "localhost",
    "port": "27017",
    "replicaSet": {
      "name": "",
      "members": [
        // {
        //   "host": "localhost",
        //   "port": "27017"
        // },
        // {
        //   "host": "localhost",
        //   "port": "27027"
        // },
        // {
        //   "host": "localhost",
        //   "port": "27037"
        // }
      ]
    },
    "db": "study"
  }

}
module.exports = config;
