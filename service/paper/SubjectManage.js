const log = require('../../util/log').getLogger("SubjectManage");
const mongo = require('../../util/mongo');

class SubjectManage{
    constructor(){}

    async getSubjectsOfPaper(paperId){
      var data = await mongo.find("TestPaper",{'_id': paperId})
      return data
    }

}

module.exports = SubjectManage
