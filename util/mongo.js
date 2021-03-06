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
  log.info(`insertOne: param is {collection,data}}`, collection, data)
  return new Promise(( resolve, reject ) => {
    connectDB(function (db) {
      db.collection(collection).insertOne(data, function (err, result) {
        if (err) {
          log.error(`insertOne fail ${err}`)
          reject(err)
        }else{
          log.info(`insertOne success`)
          resolve(result)
          //db.close()
        }

      })
    })
  })
}
module.exports.insertMany = function (collection, dataArr) {
  log.info(`insertOne: param is {collection,dataArr}}`, collection, dataArr)
  return new Promise(( resolve, reject ) => {
    connectDB(function (db) {
      db.collection(collection).insertMany(dataArr, function (err, result) {
        if (err) {
          log.error(`insertMany fail ${err}`)
          reject(err)
        }else{
          log.info(`insertMany success`)
          resolve(result)
          //db.close()
        }

      })
    })
  })
}
// 插入一个文档数据
module.exports.remove = function (collection, query) {
  log.info(`remove: param is {collection,query}}`, collection, query)
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
          //db.close()
        }

      })
    })
  })
}
// 插入一个文档数据
module.exports.updateOne = function (collection, query, data) {
  log.info(`update: param is {collection,query,data}}`, collection,query, data)
  if(query._id){
    query._id = mongoose.Types.ObjectId(query._id)
  }
  return new Promise(( resolve, reject ) => {
    connectDB(function (db) {
      db.collection(collection).updateOne(query, data, function (err, result) {
        if (err) {
          log.error(`mongo update fail ${err}`)
          reject(err)
        }else{
          log.info(`mongo update success, resutl is ${result}`)
          resolve(result)
          //db.close()
        }

      })
    })
  })
}

// 查询数据，condition为{}时可以查询该集合下的所有文档
module.exports.find = async (collection, query, limit, skip) => {
  log.info(`find: param is {collection,query,limit,skip}`, collection, query, limit, skip)
  if(!limit){
    limit = 10000
  }
  if(!skip){
    skip = 0
  }
  if(query._id){
    query._id = mongoose.Types.ObjectId(query._id)
  }
  log.info(`mongo.find: collecton is ${query}, query is`, query)
  return new Promise(( resolve, reject ) => {
  connectDB(function (db) {
    db.collection(collection).find(query).limit(limit).skip(skip).toArray(function (err, result) {
      if (err) {
        log.error("mongo query fail",err)
        reject(err)
      }
      log.debug("mongo query success",result)
      resolve(result)
      //db.close()
    })
  })
  })
}
