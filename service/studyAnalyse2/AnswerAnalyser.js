const log = require('../../util/log').getLogger("AnswerAnalyser");
const path = require('path')
const uuid = require('uuid')
const fs = require('fs');

class Answer{
  constructor(type, answer){
    //题目类型(1-选择题 2-判断题 9-未知)
    this.type = type
    this.answer = answer
  }
}


class AnswerAnalyser{
    constructor(contentArr){
      //题目内容
      this.contentArr = contentArr
      //选择题规则特征最小匹配次数
      this.minMatchTimes = 3
    }

    getAnswer(){
      var type = 9
      var answer = null
      if(this.isChoiceQuestion()){
        type = 1
        answer = this.getAnswerOfChoiceQuestion()
      }

      if(this.isTrueOrFalseQuestion()){
        this.type = 2
        answer = this.getAnswerOfTrueOrFalseQuestion()
      }
      return new Answer(type, answer)
    }

    isChoiceQuestion(){
      var regExpArr = []
      regExpArr.push(/[Aa]./)
      regExpArr.push(/[Bb]./)
      regExpArr.push(/[Cc]./)
      regExpArr.push(/[Dd]./)
      var matchTimes = 0
      for (var i = 0; i < regExpArr.length; i++) {
        for (var index in this.contentArr) {
          if(this.contentArr[index].match(regExpArr[i])){
            matchTimes++
          }
        }

      }
      if(matchTimes >= this.minMatchTimes){
        return true
      }else{
        return false
      }
    }

    getAnswerOfChoiceQuestion(){
      var regEx = /[\(（\[【](A|AB|AC|AD|ABC|ABD|ACD|ABCD|B|BC|BD|BCD|C|CD|D)[]\)）\]|】]$/
      for (var index in this.contentArr) {
        var matchArr = regEx.exec(this.contentArr[index])
        if(matchArr && matchArr.length > 0){
          return matchArr[matchArr.length - 1]
        }
      }
      return null
    }

    isTrueOrFalseQuestion(){
      var regEx = /(\(|（|\[|【)(X|x|j|J)(\)|）|\]|】)$/
      for (var index in this.contentArr) {
        var matchArr = regEx.exec(this.contentArr[index])
        if(this.contentArr[index].match(regEx)){
          return true
        }
      }
      return false
    }

    getAnswerOfTrueOrFalseQuestion(){
      var regEx = /[\(（\[【][XxjJ][\)）\]】]$/
      for (var index in this.contentArr) {
        var matchArr = regEx.exec(this.contentArr[index])
        if(matchArr && matchArr.length > 0){
          return matchArr[matchArr.length - 1]
        }
      }
      return null
    }
}

module.exports = AnswerAnalyser
