const router = require('koa-router')()
var mysql      = require('mysql2');
var config      = require('../config.js');

router.prefix('/test')

router.get('/mongoos', function (ctx, next) {
  var connection = mysql.createConnection({
    // host     : config.db.host,
    // user     : config.db.user,
    // password : config.db.password,
    // database : config.db.database,
    // port     : config.db.port,
    host     : "rm-wz98ecqcf1jvu5631uo.mysql.rds.aliyuncs.com",
    user     : "vue",
    password : "TianHan928",
    database : "vue-study",
    port     : 3306,

  });

  connection.connect();

  // connection.query('SELECT * from user', function (error, results, fields) {
  //   if (error) throw error;
  //   console.log('The user is: ', results);
  // });

  connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
  if (error) throw error;
  //console.log('The solution is: ', results[0].solution);
});
  ctx.body = results
})



module.exports = router
