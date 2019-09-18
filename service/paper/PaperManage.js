const log = require('../../util/log').getLogger("PaperManage");
const mongo = require('../../util/mongo');

class PaperManage{
    constructor(){
      this.collection = 'TestPaper'
    }

    async getPaperList(userId){
      var data = await mongo.find(this.collection,{})
      return data
    }

    async getPaperInfo(paperId){
      var data = await mongo.find(this.collection,{'_id': paperId})
      return data
    }

    async deletePaper(paperId){
      var data = await mongo.remove(this.collection,{_id: paperId})
      return data
    }

    async getSubjectInfo(paperId, subjectId){
      var data = await mongo.find(this.collection,{'_id': paperId})
      if(data.length == 0) return {}

      var subjects = data[0].subjects
      for (var index in subjects) {
        if (subjects[index]['subjectId'] == subjectId) {
          return subjects[index]
        }
      }

    }

    async checkSubject(paperId, subjectId, answer){
      var data = await mongo.updateOne(this.collection,{'_id': paperId, 'subjects.subjectId': subjectId},{"$set":{"subjects.$.answer.status":answer}})
      return data
    }

    async commentSubject(paperId, subjectId, commentText, commentAudioUrl,knowledge){
      var data = await mongo.updateOne(
        this.collection,
        {'_id': paperId, 'subjects.subjectId': subjectId},
        {"$set":{
          "subjects.$.commentText":commentText,
          "subjects.$.knowledge":knowledge, 
          "subjects.$.commentAudioUrl":commentAudioUrl
        }})
      return data
    }

}

module.exports = PaperManage
