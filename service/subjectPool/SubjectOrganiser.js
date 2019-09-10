const log = require('../../util/log').getLogger("SubjectOrganiser");
const elastic = require('../../util/elastic')
const mongo = require('../../util/mongo')
const uuid = require('uuid');

class SubjectOrganiser{
  constructor(){}

  async add(userId, subjectId){
    log.info('add: param is {userId, subjectId} ',userId,subjectId)
    var collection = 'subject_group'
    var query = {
      'userId': userId
    }
    var subjectData = await mongo.find(collection,query,1)
    if(subjectData && subjectData.length > 0 ){
      var subjectIds = subjectData[0].subjectIds
      subjectIds.push(subjectId)
      var data = {
        'userId': userId,
        'subjectIds': subjectIds
      }
      mongo.update(collection, query, data)
    }else{
      var data = {
        'userId': userId,
        'subjectIds': [subjectId]
      }
      mongo.insertOne(collection, data)
    }

  }

}

module.exports = SubjectOrganiser
