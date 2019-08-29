const log = require('../../util/log').getLogger("SubjectAnalyser2");
const path = require('path')
const uuid = require('uuid')
const fs = require('fs');

class SubjectAnalyser{
    constructor(testPaper, regExp){
      //要匹配的正则表达式
      this.regExp = regExp
      //原始数据
      this.testPaper = testPaper;
      //原始数据
      this.sourceData = testPaper.sourceData;
      //以数字开头的数据
      this.possibleSubjects = []
      //以数字开头的,X坐标对齐且数值正常的数据
      this.validSubjects = []
      //Ｘ轴匹配偏差（用于判断编号是否和其他编号匹配）
      this.xOffset = 0.02
      //最小匹配个数（达到这个值才判定为题目编号）
      this.matchAmount = 1
    }

    execute(){
      this.extractPosibleSubject()
      this.extractValidSubject()
    }

    getValidSubjects(){return this.validSubjects}
    getAmount(){return this.validSubjects.length}

    //将可能的题目提取出来（规则：数字打头的）
    extractPosibleSubject(){
      var result = []
      var length = this.sourceData.length
      for (var i = 0; i < length; i++) {
        //if(this.sourceData[i].Confidence < 60)continue
        var item = this.sourceData[i].itemstring
        //若长度小于5，不当做题目
        if(item.length < 5)continue
        //若全部是数字，不当做题目
        if(item.match(/^\d+$/))continue

    		var mathResult = item.match(this.regExp);
    		if(mathResult) {
    			this.sourceData[i].subjectNo = mathResult[0]
          result.push(this.sourceData[i])
    		}
      }
      this.possibleSubjects = result
      log.info(`和正则表达式${this.regExp}匹配的题目共${result.length}条`)
    }

    /*
    将有效的题目提取出来
    规则1（坐标对齐）：至少和其它两题对齐，X坐标偏移不超过试卷宽度的偏移值
    */
    extractValidSubject(){
      var result = []
      var length = this.possibleSubjects.length
      //若数目较少，则不做任何剔除
      if(length <= 5){
        this.validSubjects = this.possibleSubjects
        return
      }

      for (var i = 0; i < length; i++) {
        var item = this.possibleSubjects[i]
        //去掉坐标明显不对齐的
        var likeNum = 0  //记录有多少数据的X坐标和自己对齐
        for (var j = 0; j < length; j++) {
          //log.debug("开始剔除不对齐数据")
          var offset = item['itemcoord']['x'] - this.possibleSubjects[j]['itemcoord']['x']
          if(Math.abs(offset) < (this.testPaper.getMaxX() * this.xOffset)) likeNum++
        }
        if(likeNum < this.matchAmount + 1) {
          log.debug("剔除X偏离数据",item)
          continue
        }
        result.push(this.possibleSubjects[i])
      }
      this.validSubjects = result
      log.info(`用正则表达式${this.regExp}提取的题目共${result.length}条：`, result)
    }

}

module.exports = SubjectAnalyser
