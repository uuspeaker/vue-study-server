const log = require('../../util/log').getLogger("SubjectLoader");
const elastic = require('../../util/elastic')
const mongo = require('../../util/mongo')
const uuid = require('uuid');

class SubjectLoader{
  constructor(){}

  async load(){
    log.info('开始导入数据')
    var collection = 'XkwSubject'
    var condition = {}
    var limit = 20
    var skip = 0
    var hasData = true
    var loadAmount = 0
    while(hasData){
      var subjectData = await mongo.find(collection, condition, limit, skip)
      log.info(`查询到${subjectData.length}条数据`)
      if(subjectData.length >= limit){
        hasData = true
        var dataArr = []
        for (var index in subjectData) {
          //log.info('组装数据',subjectData[index])
          var id = uuid.v1()
          delete subjectData[index]['_id']
          var data = {
            index: 'subject_data',
            type: 'xkw_subject',
            body: subjectData[index]
          }
          await elastic.create(data)
          loadAmount++
          // dataArr.push(data)

        }
        // await elastic.bulk(dataArr)
        log.info(`导入${loadAmount}条数据`)
      }else {
        hasData = false
        log.info('数据导入完成',subjectData[index])
      }
    }
  }

  async deleteById(id){
    var data = {
      index: 'subject_data',
      type: 'xkw_subject',
      id: id
    }
    await elastic.delete(data)
  }

  async deleteAll(){
    var data = {
      index: 'subject_data',
      type: 'xkw_subject',
      body: {
        query: {}
      }}
    await elastic.deleteByQuery(data)
  }
}

module.exports = SubjectLoader
