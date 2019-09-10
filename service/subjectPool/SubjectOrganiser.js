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
    var subjectIds = await this.getIds(userId)
    if(subjectIds && subjectIds.length > 0 ){
      var index = subjectIds.indexOf(subjectId);
      if (index > -1) return 0
      subjectIds.push(subjectId)
      var data = {
        'userId': userId,
        'subjectIds': subjectIds
      }
      await mongo.update(this.collection, query, data)
      return 1
    }else{
      var data = {
        'userId': userId,
        'subjectIds': [subjectId]
      }
      await mongo.insertOne(this.collection, data)
      return 1
    }
  }

  async getIds(userId){
    log.info('getIds: param is {userId} ',userId)
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

  async getSubjects(userId){
    log.info('getSubjects: param is {userId} ',userId)
    var subjectIds = await this.getIds(userId)
    var query = {
      'subjectId': {$in:subjectIds}
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
    var subjectIds = await this.getIds(userId)
    if(subjectIds && subjectIds.length > 0 ){
      var index = subjectIds.indexOf(subjectId);
      if (index == -1) return 0
      var resultSubject = subjectIds.splice(index,1)[0];
      var query = {
        'userId': userId
      }
      var data = {
        'userId': userId,
        'subjectIds': resultSubject
      }
      await mongo.update(this.collection, query, data)
      return 1

    }
  }

}

module.exports = SubjectOrganiser
