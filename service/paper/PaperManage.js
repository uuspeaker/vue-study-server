const log = require('../../util/log').getLogger("PaperManage");
const mongo = require('../../util/mongo');
const ocr = require('../../util/ocrOld');
const graphic = require('../../util/graphic');
const cos = require('../../util/cos');
const TestPaper = require('../../service/studyAnalyse2/TestPaper');
const path = require('path');


class PaperManage{
    constructor(){
      this.collection = 'PaperInfo'
    }

    async analysePaper(userId, file){
      var result = await cos.putObject(file.path)
      var adjuectedFilePath = await this.getAdjustedFile(file)
      var ocrResult = await ocr.scanImageUrl(result.Location)
      log.debug("文件ocr扫描结果为",ocrResult)
      var testPaper = new TestPaper(adjuectedFilePath, JSON.parse(ocrResult).data.items)
      await testPaper.parse()
      var testPaperInfo = {
        paperId: testPaper.getPaperId(),
        userId: userId,
        paperName: this.getFileName(file),
        subjectAmount: testPaper.getSubjectAmount(),
        paperUrl: result.Location,
        createData: new Date()
      }
      mongo.insertOne(this.collection, testPaperInfo)
      this.saveSubjects(testPaper.getSubjectInfos())
      return testPaperInfo
    }

    async saveSubjects(subjects){
      mongo.insertMany(this.collection, subjects)
    }

    getFileName(file){
      var dirName = path.dirname(file.path);
      var extname = path.extname(file.path);
      var fileName = path.basename(file.path, extname);
      return fileName
    }

    async getAdjustedFile(file){
      var dirName = path.dirname(file.path);
      var extname = path.extname(file.path);
      var fileName = path.basename(file.path, extname);

      var cosFilePath = dirName +'\\'+ fileName + '-cos' + extname
      await graphic.saveOrient(file.path,cosFilePath)
      log.debug("将图片调整成正确方向并保存",cosFilePath)
      return cosFilePath
    }

    async getPaperList(userId){
      var data = await mongo.find(this.collection,{})
      return data
    }

    async getPaperInfo(paperId){
      var data = await mongo.find(this.collection,{'paperId': paperId})
      return data
    }

    async deletePaper(paperId){
      var data = await mongo.remove(this.collection,{'paperId': paperId})
      return data
    }

    async increaseCheckAmount(paperId){
      var paperInfo = await this.getPaperInfo(paperId)
      var data = await mongo.updateOne(
        this.collection,
        {'paperId': paperId},
        {"$set":{"checkAmount":1 + paperInfo[0].checkAmount}})
      return data
    }

    // async getSubjectInfo(paperId, subjectId){
    //   var data = await mongo.find(this.collection,{'paperId': paperId})
    //   if(data.length == 0) return {}
    //
    //   var subjects = data[0].subjects
    //   for (var index in subjects) {
    //     if (subjects[index]['subjectId'] == subjectId) {
    //       return subjects[index]
    //     }
    //   }
    // }
    //
    // async getSubjectWrong(){
    //   var data = await mongo.find(this.collection,{'paperId': paperId})
    //   if(data.length == 0) return {}
    //
    //   var subjects = data[0].subjects
    //   for (var index in subjects) {
    //     if (subjects[index]['subjectId'] == subjectId) {
    //       return subjects[index]
    //     }
    //   }
    // }
    //
    // async checkSubject(paperId, subjectId, answer){
    //   var data = await mongo.updateOne(
    //     this.collection,
    //     {'_id': paperId, 'subjects.subjectId': subjectId},
    //     {"$set":{"subjects.$.answer.status":answer,"subjects.$.isChecked":1}})
    //   return data
    // }
    //
    // async commentSubject(paperId, subjectId, commentText, commentAudioUrl,knowledge){
    //   var data = await mongo.updateOne(
    //     this.collection,
    //     {'_id': paperId, 'subjects.subjectId': subjectId},
    //     {"$set":{
    //       "subjects.$.commentText":commentText,
    //       "subjects.$.knowledge":knowledge,
    //       "subjects.$.commentAudioUrl":commentAudioUrl
    //     }})
    //   return data
    // }



}

module.exports = PaperManage
