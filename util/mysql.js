const mysql = require('mysql2');
const log = require('../util/log.js').getLogger("mysql.js");
const config = require('../config/db.js')

const pool = mysql.createPool({
    user:config.mysql.user,
    password:config.mysql.password,
    database:config.mysql.database,
    host:config.mysql.host,
    port:config.mysql.port,
    charset:'utf8mb4',
})

module.exports.execute2 = async ( sql, param ) => {
  log.info(`mysql.execute: sql is ${sql}, param is`,param)
  var connection = await pool.getConnection()
  var result = connection.query(sql, data)
  connection.release();
  log.info(`sql执行成功, result`,result)
  return result
}

module.exports.execute = ( sql, values ) => {
  return new Promise(( resolve, reject ) => {
    pool.getConnection(function(err, connection) {
        if (err) {
          log.error(`获取数据库连接失败`,err)
          reject( err )
        } else {
          log.info(`获取数据库连接成功`)
          connection.query(sql, values, ( err, result) => {
            if ( err ) {
              log.error(`sql执行失败`,err)
              connection.release();
              reject( err )
            }
            else  {
              log.info(`sql执行成功, result`,result)
              connection.release();
              resolve( result )
            }

          })
      }
    })
  })
}
