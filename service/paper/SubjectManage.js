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
      var data = await mongo.find(this.collection,{'answerStatus': 0})
      return data
    }

    async checkSubject(subjectId, answerStatus){
      var data = await mongo.updateOne(
        this.collection,
        {'subjectId': subjectId},
        {"$set":{"answerStatus":answerStatus}})
      return data
    }

    async commentSubject(subjectId, commentText, commentAudioUrl,knowledge){
      var data = await mongo.updateOne(
        this.collection,
        {'subjectId': subjectId},
        {"$set":{
          "commentText":commentText,
          "knowledge":knowledge,
          "commentAudioUrl":commentAudioUrl
        }})
      return data
    }

}

module.exports = SubjectManage
