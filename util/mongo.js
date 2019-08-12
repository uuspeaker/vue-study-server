const config = require('../config/db.js');
const log = require('../util/log.js').getLogger("mongo.js");
const mongoose = require('mongoose');

const URL = config.mongo.host;
const DB = config.mongo.database;

const connectDB = async (callback) => {
  // { useNewUrlParser: true } 是为了向前兼容
  await mongoose.connect(URL, { useNewUrlParser: true }, function(err, db) {
    if (err) {
      log.error(`database connect fail ${err}`)
      throw err
    }
    log.info(`database connect success`)
    callback(db)
  })
}

// 插入一个文档数据
module.exports.insertOne = function (collection, data, callback) {
  log.info(`mongo.insertOne: collecton is ${collection}, data is ${JSON.stringify(data)}`)
  return new Promise(( resolve, reject ) => {
    connectDB(function (db) {
      db.collection(collection).insertOne(data, function (err, result) {
        if (err) {
          log.error(`mongo insert fail ${err}`)
          reject(err)
        }else{
          log.info(`mongo insertOne success, resutl is ${result}`)
          resolve(result)
          db.close()
        }

      })
    })
  })
}

// 查询数据，condition为{}时可以查询该集合下的所有文档
module.exports.find = async (collection, condition) => {
  log.info(`mongo.find: collecton is ${collection}, condition is`, condition)
  return new Promise(( resolve, reject ) => {
  connectDB(function (db) {
    db.collection(collection).find(condition).toArray(function (err, result) {
      if (err) {
        log.error("mongo query fail",err)
        db.close()
        reject(err)
      }
      log.info("mongo query result",result)
      db.close()
      resolve(result)
    })
  })
  })
}
module.exports.find2 = async (collection, condition) => {
  log.info(`开始查询: collecton is ${collection}, condition is`, condition)
  await connectDB(function (db) {
    db.collection(collection).find(condition).toArray(function (err, result) {
      if (err) {
        log.error("mongo query fail",err)
        db.close()
        throw err
      }
      log.info("mongo query result",result)
      callback(result)
      db.close()
    })
  })
}
