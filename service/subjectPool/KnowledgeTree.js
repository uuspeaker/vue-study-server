const log = require('../../util/log').getLogger("KnowledgeTree");
const mongo = require('../../util/mongo');

class KnowledgeTree{
    constructor(){}

    //将可能的题目提取出来（规则：数字打头的）
    async getAll(){
      var data = await mongo.find("KnowledgeTree",{})
      //log.debug('getAll',data)
      return data
    }

    async getChildren(knowledgeId){
      var data = await mongo.find("KnowledgeTree",{'knowledgeId': knowledgeId})
      //log.debug('getChildren',knowledgeId, data)
      return data
    }

}

module.exports = KnowledgeTree
