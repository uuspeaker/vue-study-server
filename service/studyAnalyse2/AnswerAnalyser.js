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
        type = 2
        answer = this.getAnswerOfTrueOrFalseQuestion()
      }
      return new Answer(type, answer)
    }

    isChoiceQuestion(){
      var regExpArr = []
      regExpArr.push(/[Aa]\./)
      regExpArr.push(/[Bb]\./)
      regExpArr.push(/[Cc]\./)
      regExpArr.push(/[Dd]\./)
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
      var regExAfter = /(A|AB|AC|AD|ABC|ABD|ACD|ABCD|B|BC|BD|BCD|C|CD|D)\s*[\)）\]|】]?$/
      var regExBefore = /^[\(（\[【]\s*(A|AB|AC|AD|ABC|ABD|ACD|ABCD|B|BC|BD|BCD|C|CD|D)/
      var regResult = /[ABCD]+/
      for (var index in this.contentArr) {
        var matchArr = regExAfter.exec(this.contentArr[index])
        if(matchArr && matchArr.length > 0){
          return regResult.exec(matchArr[matchArr.length - 1])[0]
        }
        matchArr = regExBefore.exec(this.contentArr[index])
        if(matchArr && matchArr.length > 0){
          return regResult.exec(matchArr[matchArr.length - 1])[0]
        }
      }
      return null
    }

    isTrueOrFalseQuestion(){
      var regExBefore = /[VvXxJ]\s*[\)）\]|】]$/
      var regExAfter = /^[\(（\[【]\s*[VvXxJ]/
      for (var index in this.contentArr) {
        if(this.contentArr[index].match(regExAfter)){
          return true
        }
        if(this.contentArr[index].match(regExBefore)){
          return true
        }
      }
      return false
    }

    getAnswerOfTrueOrFalseQuestion(){
      var regExAfter = /[VvXxJ]\s*[\)）\]】]$/
      var regExBefore = /^[\(（\[【]\s*[VvXxJ]/
      var regRight = /[VvJ]/
      var regWrong = /[Xx]/
      for (var index in this.contentArr) {
        var matchArr = regExAfter.exec(this.contentArr[index])
        if(matchArr && matchArr.length > 0){
          var matchResult = matchArr[matchArr.length - 1]
          if(matchResult.match(regRight)){
            return 1
          }else {
            return 0
          }
        }
        matchArr = regExBefore.exec(this.contentArr[index])
        if(matchArr && matchArr.length > 0){
          if(matchArr && matchArr.length > 0){
            var matchResult = matchArr[matchArr.length - 1]
            if(matchResult.match(regWrong)){
              return 1
            }else {
              return 0
            }
          }
        }
      }
      return null
    }

}

module.exports = AnswerAnalyser
