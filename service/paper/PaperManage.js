const log = require('../../util/log').getLogger("PaperManage");
const mongo = require('../../util/mongo');

class PaperManage{
    constructor(){}

    async getPaperList(userId){
      var data = await mongo.find("TestPaper",{})
      return data
    }

    async getPaperInfo(paperId){
      var data = await mongo.find("TestPaper",{'_id': paperId})
      return data
    }

    async deletePaper(paperId){
      var data = await mongo.remove("TestPaper",{_id: paperId})
      return data
    }

    async getSubjectInfo(paperId, subjectId){
      var data = await mongo.find("TestPaper",{'_id': paperId})
      if(data.length > 0){
        var subjects = data[0].subjects
        for (var index in subjects) {
          if (subjects[index]['subjectId'] == subjectId) {
            return subjects[index]
          }
        }
      }else{
        return {}
      }
    }

}

module.exports = PaperManage
