const log = require('../util/log').getLogger("elastic");
const elasticsearch = require('elasticsearch');
const config = require('../config/db')

const client = new elasticsearch.Client({
  host: config.es.host,
  log: 'error'
  });

// 查询数据，condition为{}时可以查询该集合下的所有文档
module.exports.find = async (condition) => {
  let resp;
  try{
    resp = await client.get(condition);
  }catch(err){
    log.error('查询失败',err)
    resp=null;
  }
  return resp;
}
