const log = require('../../util/log').getLogger("SubjectManage");
const mongo = require('../../util/mongo');

class SubjectManage{
    constructor(){
      this.collection = 'SubjectInfo'
    }

    async saveSubjects(subjects){
      mongo.insertMany(this.collection, subjects)
    }

    async getSubjectList(paperId){
      var data = await mongo.find(this.collection,{'paperId': paperId})
      return data
    }

    async getSubjectInfo(subjectId){
      var data = await mongo.find(this.collection,{'subjectId': subjectId})
      return data
    }

    async getSubjectWrong(userId){
      var data = await mongo.find(this.collection,{'isRight': 0})
      return data
    }

    async checkSubject(subjectId, isRight){
      var subjectInfo = await getSubjectInfo(subjectId)
      if(!subjectInfo[0].checkStatus){
        var paperManage = new PaperManage()
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

}

module.exports = SubjectManage
