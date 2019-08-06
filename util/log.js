var log4js = require('log4js');
var logsConfig = require('../config/log.js');
//加载配置文件
log4js.configure(logsConfig);

exports.getLogger = function(file){
　　return log4js.getLogger(file || "dateFileLog");
};
