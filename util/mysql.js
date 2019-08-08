const mysql = require('mysql2');
const log = require('../util/log.js').getLogger("mysql.js");
const config = require('../config/db.js')
const util = require('util');

const pool = mysql.createPool({
    user:config.mysql.user,
    password:config.mysql.password,
    database:config.mysql.database,
    host:config.mysql.host,
    port:config.mysql.port,
    charset:'utf8mb4',
})

module.exports.execute = async ( sql, param ) => {
  log.info(`执行sql: sql ${sql}, param`,param)
  const query = util.promisify(pool.query).bind(pool);
  var result = await query(sql, param)
  log.info(`sql执行成功, result`,result)
  return result
}
