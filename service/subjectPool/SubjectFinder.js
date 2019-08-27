const log = require('../../util/log').getLogger("SubjectFinder");
const mongo = require('../../util/mongo');

class SubjectFinder{
    constructor(){}

    //将可能的题目提取出来（规则：数字打头的）
    async querySubjects(knowledgeId){
      log.debug('knowledgeId',knowledgeId)
      var data = await mongo.find("XkwSubject",{'knowledgeId': knowledgeId})
      return data
    }

}

module.exports = SubjectFinder
