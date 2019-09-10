const log = require('../../util/log').getLogger("SubjectOrganiser");
const elastic = require('../../util/elastic')
const mongo = require('../../util/mongo')
const uuid = require('uuid');

class SubjectOrganiser{
  constructor(){
    this.collection = 'subject_basket'
  }

  async add(userId, subjectId){
    log.info('add: param is {userId, subjectId} ',userId,subjectId)
    var query = {
      'userId': userId
    }
    var subjectData = await this.get(userId)
    if(subjectData && subjectData.length > 0 ){
      var subjectIds = subjectData[0].subjectIds
      subjectIds.push(subjectId)
      var data = {
        'userId': userId,
        'subjectIds': subjectIds
      }
      mongo.update(this.collection, query, data)
    }else{
      var data = {
        'userId': userId,
        'subjectIds': [subjectId]
      }
      mongo.insertOne(this.collection, data)
    }
  }

  async get(userId){
    log.info('get: param is {userId} ',userId)
    var query = {
      'userId': userId
    }
    var subjectData = await mongo.find(this.collection,query,1)
    if(subjectData && subjectData.length > 0 ){
      return subjectData[0].subjectIds
    }else{
      return []
    }
  }

  async remove(userId,subjectId){
    log.info('get: param is {userId, subjectId} ',userId, subjectId)
    var subjectData = await this.get(userId)
    if(subjectData && subjectData.length > 0 ){
      var index = subjectData.indexOf(subjectId);
      var resultSubject = subjectData.splice(index,1)[0];
      var query = {
        'userId': userId
      }
      var data = {
        'userId': userId,
        'subjectIds': resultSubject
      }
      mongo.update(this.collection, query, data)
    }
  }

}

module.exports = SubjectOrganiser
