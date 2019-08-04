const config = require('../config/db.js');
const log = require('../util/log.js');
const mongoose = require('mongoose');

const URL = config.mongo.host;
const DB = config.mongo.database;

function _connectDB (callback) {
  // { useNewUrlParser: true } 是为了向前兼容
  mongoose.connect(URL, { useNewUrlParser: true }, function(err, db) {
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
  _connectDB(function (db) {
    db.collection(collection).insertOne(data, function (err, result) {
      if (err) {
        log.error(`mongo insert fail ${err}`)
        throw err
      }
      log.info(`mongo insert success, resutl is ${result}`)
      callback(result)
      db.close()
    })
  })
}
// 插入多个文档数据，传入的data必须为数组
module.exports.insert = function (collection, data, callback) {
    _connectDB(function (err, db) {
        if (err) throw err
        let database = db.db(DB)
        if (!(data instanceof Array)) {
            throw new Error('请使用数组传入多个数据，或者调用Insert添加单个数据')
        }
        if (data.length === 0) {
            throw new Error('禁止插入空数组')
        }
        database.collection(collection).insertMany(data, function(err, result) {
            callback(err, result)
            db.close()
        })
    })
}
// 删除单个数据
module.exports.deleteOne = function (collection, condition, callback) {
    _connectDB(function (err, db) {
        if (err) throw err
        let database = db.db(DB)
        database.collection(collection).deleteOne(condition, function (err, result) {
            callback(err, result)
            db.close()
        })
    })
}
// 删除多个数据
module.exports.delete = function (collection, condition, callback) {
    _connectDB(function (err, db) {
        if (err) throw err
        let database = db.db(DB)
        database.collection(collection).deleteMany(condition, function (err, result) {
            callback(err, result)
            db.close()
        })
    })
}
// 查询数据，condition为{}时可以查询该集合下的所有文档
module.exports.find = function (collection, condition, callback) {
    _connectDB(function (err, db) {
        if (err) throw err
        let database = db.db(DB)
        database.collection(collection).find(condition).toArray(function (err, result) {
            callback(err, result)
            db.close()
        })
    })
}
