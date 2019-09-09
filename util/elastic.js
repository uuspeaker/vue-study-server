const log = require('../util/log').getLogger("elastic");
const { Client, ConnectionPool} = require('@elastic/elasticsearch')
const config = require('../config/db')

ConnectionPool
const client = new Client({ node: config.es.host })

// 查询数据，condition为{}时可以查询该集合下的所有文档
module.exports.search = async (condition) => {
  const result = await client.search(condition)
}

module.exports.create = async (data) => {
  log.info('保存数据',data)
  return await client.index(data);
}
module.exports.index = async (data) => {
  await client.index(data)
}

module.exports.bulk = async (data) => {
  return await client.bulk(data);
}

module.exports.deleteByQuery = async (data) => {
  let resp=await client.deleteByQuery(data);
  log.info('删除',resp)
  return resp;
}
module.exports.delete = async (data) => {
  log.info('删除数据',data)
  let resp=await client.delete(data);
  return resp;
}
