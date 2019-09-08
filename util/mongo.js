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
module.exports.insertOne = function (collection, data) {
  log.info(`mongo.insertOne: collecton is ${collection}, data is ${JSON.stringify(data)}`)
  return new Promise(( resolve, reject ) => {
    connectDB(function (db) {
      db.collection(collection).insertOne(data, function (err, result) {
        if (err) {
          log.error(`mongo insert fail ${err}`)
          reject(err)
        }else{
          log.info(`mongo insertOne success`)
          resolve(result)
          db.close()
        }

      })
    })
  })
}
// 插入一个文档数据
module.exports.remove = function (collection, query) {
  log.info(`mongo.remove: collecton is ${collection}, query is ${JSON.stringify(query)}`)
  if(query._id){
    query._id = mongoose.Types.ObjectId(query._id)
  }
  return new Promise(( resolve, reject ) => {
    connectDB(function (db) {
      db.collection(collection).deleteOne(query, function (err, result) {
        if (err) {
          log.error(`mongo insert fail ${err}`)
          reject(err)
        }else{
          log.info(`mongo insertOne success`)
          resolve(result)
          db.close()
        }

      })
    })
  })
}
// 插入一个文档数据
module.exports.update = function (collection, query, data) {
  log.info(`mongo.update: collecton is ${collection}, data is ${JSON.stringify(data)}`)
  if(query._id){
    query._id = mongoose.Types.ObjectId(query._id)
  }
  return new Promise(( resolve, reject ) => {
    connectDB(function (db) {
      db.collection(collection).update(query, data, function (err, result) {
        if (err) {
          log.error(`mongo update fail ${err}`)
          reject(err)
        }else{
          log.info(`mongo update success, resutl is ${result}`)
          resolve(result)
          db.close()
        }

      })
    })
  })
}

// 查询数据，condition为{}时可以查询该集合下的所有文档
module.exports.find = async (collection, condition, limit, skip) => {
  if(!limit){
    limit = 10000
  }
  if(!skip){
    skip = 0
  }
  log.info(`mongo.find: collecton is ${collection}, condition is`, condition)
  return new Promise(( resolve, reject ) => {
  connectDB(function (db) {
    db.collection(collection).find(condition).limit(limit).skip(skip).toArray(function (err, result) {
      if (err) {
        log.error("mongo query fail",err)
        reject(err)
      }
      log.info("mongo query success")
      resolve(result)
      db.close()
    })
  })
  })
}
