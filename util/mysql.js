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

module.exports.execute = ( sql, data, callback ) => {
  log.info(`mysql.execute: sql is ${sql}, data is ${JSON.stringify(data)}`)
  pool.getConnection(function(err, connection) {
    if (err) {
      log.error(`database connect fail ${err}`)
      throw err
    }
    log.info(`database connect success`)
    connection.query(sql, data, ( err, result) => {
      if (err) {
        log.error(`mysql execute fail`)
        throw err
      }else {
        log.info(`mysql execute success, resutl is ${JSON.stringify(result)}`)
        callback(result)
      }
      connection.release();
    })
  })
}

module.exports.execute2 = ( sql, values ) => {
    return new Promise(( resolve, reject ) => {
        pool.getConnection(function(err, connection) {
            if (err) {
                reject( err )
            } else {
                connection.query(sql, values, ( err, fields) => {
                    if ( err )   reject( err )
                    else  resolve( fields )
                    connection.release();
                })
            }
        })
    })
}
