const log = require('../../util/log').getLogger("SubjectManage");
const mongo = require('../../util/mongo');

class SubjectManage{
    constructor(){}

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

module.exports = SubjectManage
