const log = require('../../util/log').getLogger("SubjectManage");
const mongo = require('../../util/mongo');
const PaperManage = require('../paper/PaperManage');
const paperManage = new PaperManage()

class SubjectManage{
    constructor(){
      this.collection = 'SubjectInfo'
    }

    async saveSubjects(subjects){
      mongo.insertMany(this.collection, subjects)
    }

    async getAllMySubject(userId){
      var data = await mongo.find(this.collection,{})
      return data
    }

    async getSubjectList(paperId){
      var data = await mongo.find(this.collection,{'paperId': paperId})
      return data
    }

    async getSubjectInfo(subjectId){
      var data = await mongo.find(this.collection,{'subjectId': subjectId})
      return data
    }

    async getWrongSubjectList(userId){
      var data = await mongo.find(this.collection,{'isRight': 0})
      return data
    }

    async checkSubject(subjectId, isRight){
      var subjectInfo = await this.getSubjectInfo(subjectId)
      if(!subjectInfo[0].checkStatus){
        paperManage.increaseCheckAmount(subjectInfo[0].paperId)
      }
      var data = await mongo.updateOne(
        this.collection,
        {'subjectId': subjectId},
        {"$set":{"isRight":isRight,"checkStatus":1}})
      return data
    }

    async commentSubject(subjectId, commentText, commentAudioUrl,knowledge){
      var data = await mongo.updateOne(
        this.collection,
        {'subjectId': subjectId},
        {"$set":{
          "commentText":commentText,
          "knowledge":knowledge,
          "commentAudioUrl":commentAudioUrl,
          "checkStatus":2
        }})
      return data
    }
    async getReport(userId){
      var subjectList = await this.getAllMySubject(userId)
      var wrongSubjectAmount = 0
      var wrongSubjectKnowledge = []
      for (var index in subjectList) {
        if(subjectList[index].isRight == 0 && subjectList[index]['knowledge']){
          wrongSubjectAmount = wrongSubjectAmount + 1
          var hasWrongKnowledge = 0
          for (var index2 in wrongSubjectKnowledge) {
            if (wrongSubjectKnowledge[index2]['knowledge'] == subjectList[index]['knowledge']) {
              wrongSubjectKnowledge[index2]['amount'] = wrongSubjectKnowledge[index2]['amount'] + 1
              hasWrongKnowledge = 1
            }
          }
          if(hasWrongKnowledge == 0){
            wrongSubjectKnowledge.push({'knowledge':subjectList[index]['knowledge'],'amount':1})
          }
        }
      }
      return {wrongSubjectAmount:wrongSubjectAmount, wrongSubjectKnowledge: wrongSubjectKnowledge}
    }

}

module.exports = SubjectManage
