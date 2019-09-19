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
    }

    async getSubjectInfo(subjectId){
      var data = await mongo.find(this.collection,{'_id': subjectId})
    }

    async getSubjectWrong(userId){
      var data = await mongo.find(this.collection,{'answerStatus': 0})
    }

    async checkSubject(subjectId, answerStatus){
      var data = await mongo.updateOne(
        this.collection,
        {'_id': subjectId},
        {"$set":{"answerStatus":answerStatus}})
      return data
    }

    async commentSubject(subjectId, commentText, commentAudioUrl,knowledge){
      var data = await mongo.updateOne(
        this.collection,
        {'_id': subjectId},
        {"$set":{
          "commentText":commentText,
          "knowledge":knowledge,
          "commentAudioUrl":commentAudioUrl
        }})
      return data
    }

}

module.exports = SubjectManage
