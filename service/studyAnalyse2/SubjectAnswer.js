const log = require('../../util/log').getLogger("SubjectAnswer");
const mongo = require('../../util/mongo');

class Answer{
  constructor(type, answer, status){
    //题目类型(1-选择题 2-判断题 9-未知)
    this.type = type
    this.answer = answer
    this.status = status
  }
}


class SubjectAnswer{
    constructor(contentArr){
      //题目内容
      this.contentArr = contentArr
      //选择题规则特征最小匹配次数
      this.minMatchTimes = 3
    }

    async getAnswer(){
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
      var status = await this.getCorrectAnswer(type, answer)
      return new Answer(type, answer, status)
    }

    async getCorrectAnswer(type, answer){
      var queryStr = this.contentArr[0].substring(3)
      queryStr = queryStr.replace("'","\'")
      queryStr = queryStr.replace('"','\"')
      queryStr = queryStr.replace("\\","\\\\")
      queryStr = queryStr.replace("[","\[")
      queryStr = queryStr.replace("]","\]")
      queryStr = queryStr.replace("(","\(")
      queryStr = queryStr.replace(")","\)")
      queryStr = queryStr.replace("{","\{")
      queryStr = queryStr.replace("}","\}")
      queryStr = queryStr.replace(".","\.")
      queryStr = queryStr.replace("+","\+")
      queryStr = queryStr.replace("^","\^")
      queryStr = queryStr.replace("$","\$")
      queryStr = queryStr.replace("?","\?")
      queryStr = queryStr.replace("|","\|")
      var queryReg = new RegExp(queryStr)

      var condition = {'questionContent':  queryReg}
      var data = await mongo.find('XkwSubject', condition, 3)
      log.debug('查询出对应的题目是',data)
      var status = 9
      if(data.length == 0){
        status = 9
      }else{
        var questionType = data[0]['questionType']
        var rightAnswer = data[0]['answer']
        if(questionType == type){
          if(answer == questionType){
            status = 1
          }else{
            status = 0
          }
        }
      }
      return status
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

module.exports = SubjectAnswer
