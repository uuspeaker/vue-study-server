const log = require('../../util/log').getLogger("AnswerChecker");
const path = require('path')
const uuid = require('uuid')
const fs = require('fs');

class AnswerChecker{
    constructor(content){
      //内容
      this.content = content
    }

    //计算两个题目是否重合
    getAnswer(){

    }

}

module.exports = AnswerChecker
