const log = require('../../util/log').getLogger("TestPaper");
const path = require('path')
const uuid = require('uuid')
const fs = require('fs');
const Subject = require('./Subject')
const SubjectAnalyser = require('./SubjectAnalyser')

class TestPaper{
    constructor(sourceUrl,sourceData){
      //log.debug("试卷原始数据",sourceData)
      this.targetDir = ''
      //原始图片地址
      this.sourceUrl = sourceUrl;
      //原始数据
      this.sourceData = sourceData;
      //每一行的高度
      this.lineHeight = 0
      //以数字开头的数据
      this.possibleSubjects = []
      //以数字开头的,X坐标对齐且数值正常的数据
      this.validSubjects = []
      //每道题完整内容
      this.subjectInfos = []
      //页数
      this.pageCount = 1
      //试卷的起始坐标
      this.paperPolygon = {
        minX:999999,
        maxX:0,
        minY:999999,
        maxY:0,
      }
      //题目的最大宽度
      this.maxSubjectWidth = 0


    }

    async init(){
      this.deleteHeadAndFoot()
      this.calculatePaperStructure()
      this.initValidSubjects()
      this.sortSubjects()
      this.calculatePages()
      this.initMaxSubjectLength()
      await this.mkdir()
      await this.constructSubjects()
    }

    async mkdir(){
      var targetDir = path.resolve(`./test/tmp/${uuid.v1()}`);
      this.targetDir = targetDir
      log.info('创建目录',targetDir)
      await fs.mkdirSync(targetDir,{recursive:true},(err,result)=>{
        if(err){
          log.error('创建目录失败',err)
          return
        }else{
          log.info('创建目录成功',result)
        }

      })
    }

    getTargetDir(){return this.targetDir}
    getSourceUrl(){return this.sourceUrl}
    getSourceData(){return this.sourceData}
    getMinX(){return this.paperPolygon.minX}
    getMaxX(){return this.paperPolygon.maxX}
    getMinY(){return this.paperPolygon.minY}
    getMaxY(){return this.paperPolygon.maxY}
    getLineHeight(){return this.lineHeight}
    getLine(lineNo){return this.sourceData[lineNo]}
    getSubjectCount(){return this.validSubjects.length}
    getDataCount(){return this.sourceData.length}
    getValidSubjects(){return this.validSubjects}
    getSubjectInfos(){return this.subjectInfos}
    getPaperPolygon(){return this.paperPolygon}
    getMaxSubjectWidth(){return this.maxSubjectWidth}

    getSubjectData(sortNo){
      if(sortNo && sortNo >= 1 && sortNo <= this.validSubjects.length){
        return this.validSubjects[sortNo-1]
      }else{
        log.info(`编号输入错误，请输入1-${this.validSubjects.length}范围内的编号，实际输入${sortNo}`)
      }
    }

    //计算试卷结构数据，包括坐标
    deleteHeadAndFoot(){
      var length = this.sourceData.length
      var hasDeleteLast = false
      for (var i = length -1; i > 0; i--) {
        var regExp = /共\d{1,2}页/;
        var regExp2 = /第\d{1,2}页/;
        var item = this.sourceData[i].itemstring
        var mathResult = item.match(regExp) || item.match(regExp2);
        if(mathResult){
          log.info(`清理掉${this.sourceData[i].itemstring}`)
          this.sourceData.pop()
          hasDeleteLast = true
        }else{
          if(hasDeleteLast)return
        }
      }
    }

    //计算试卷结构数据，包括坐标
    calculatePaperStructure(){
      var length = this.sourceData.length
      for (var i = 0; i < length; i++) {
        if(i == 0){
          this.lineHeight = this.sourceData[0]['itemcoord']['height']
          log.debug("lineHeight", this.lineHeight)
        }
        //获取最大的X坐标
        if(this.paperPolygon.minX > this.sourceData[i]['itemcoord']['x']){
          this.paperPolygon.minX = this.sourceData[i]['itemcoord']['x']
        }
        if(this.paperPolygon.maxX < this.sourceData[i]['itemcoord']['x'] + this.sourceData[i]['itemcoord']['length']){
          this.paperPolygon.maxX = this.sourceData[i]['itemcoord']['x'] + this.sourceData[i]['itemcoord']['length']
        }
        if(this.paperPolygon.minY > this.sourceData[i]['itemcoord']['y']){
          this.paperPolygon.minY = this.sourceData[i]['itemcoord']['y']
        }
        //var regExp = /^*第\d{1,2}页*共\d{1,2}页/;
        if(this.paperPolygon.maxY < this.sourceData[i]['itemcoord']['y'] + this.sourceData[i]['itemcoord']['heigth']){
          this.paperPolygon.maxY = this.sourceData[i]['itemcoord']['y' + this.sourceData[i]['itemcoord']['heigth']]
        }
      }
      log.info("获取试卷坐标", this.paperPolygon)
    }

    //分析题目
    initValidSubjects(){
      var　regExpArr = []
      regExpArr.push(/^\d{1,2}\D+/)//小写数字
      regExpArr.push(/^\(|（\d{1,2}\(|（/) //带括号小写数字
      regExpArr.push(/^\[一二三四五六七八九十]{1,2}/)//大写数字
      regExpArr.push(/^\(|（[一二三四五六七八九十]{1,2}\(|（/)//带括号大写数字
      regExpArr.push(/^\[a-z]{1,2}/)//小写字母
      regExpArr.push(/^\(|（\[a-z]{1,2}\(|（/) //带括号小写字母
      regExpArr.push(/^\[ⅠⅡⅢⅤ]{1,2}/)//希腊字母
      regExpArr.push(/^\(|（\[ⅠⅡⅢⅤ]{1,2}\(|（/) //带括号希腊字母
      regExpArr.push(/^\[①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳❶❷❸❹❺❻❼❽❾❿]{1,2}/)//带圈数字
      var regIndex = 0
      var maxMatchTime = 0
      for (var i = 0; i < regExpArr.length; i++) {
        log.debug('regExpArr[i]',regExpArr[i])
        var matchTime = 0
        var subjectAnalyser = new SubjectAnalyser(this, regExpArr[i])

        subjectAnalyser.execute()
        if(subjectAnalyser.getAmount() > maxMatchTime){
          regIndex = i
          maxMatchTime = subjectAnalyser.getAmount()
          this.validSubjects = subjectAnalyser.getValidSubjects()
        }
        //若规则已经找出10条以上，为提升性能，跳过其他规则
        if(subjectAnalyser.getAmount() >= 10)break
      }
      log.info("匹配规则是", regExpArr[regIndex],this.validSubjects)
      return regExpArr[regIndex]
    }

    //计算题目最大长度
    initMaxSubjectLength(){
      var itemLengths = []
      var totalLength = 0
      var itemMinX = 1000000
      var itemMaxX = 0
      var length = this.validSubjects.length
      for (var i = 0; i < length; i++) {
        //log.debug(`解析第${i+1}条数据`,this.validSubjects[i])
        let itemLength = this.validSubjects[i]['itemcoord']['width']
        itemLengths.push(itemLength)
        totalLength += itemLength
      }
      var validMaxLength = 0
       var itemAvgLength = totalLength/(length+1)
       var checkMaxLength = itemAvgLength * 2
       for (var i = 0; i < itemLengths.length; i++) {
         if(itemLengths[i] > validMaxLength && itemLengths[i] < checkMaxLength){
           validMaxLength = itemLengths[i]
         }
       }
      // var testPaperLength = itemMaxX - itemMinX
      if(this.getMaxX()*0.9/this.pageCount > validMaxLength){
        this.maxSubjectWidth = this.getMaxX()*0.9/this.pageCount
      }else{
        this.maxSubjectWidth = validMaxLength
      }

      log.debug("题目宽度为:",validMaxLength)
    }

    //根据题号排序(升序)
    sortSubjects(){
      var length = this.validSubjects.length
      for (var i = 0; i < length; i++) {
        this.validSubjects[i].rankValue = this.validSubjects[i]['itemcoord']['x'] * 2 +  this.validSubjects[i]['itemcoord']['y']
      }
      var sortedData = this.validSubjects.sort((a,b) => {
        return a.rankValue -  b.rankValue
      })
      for (var i = 0; i < sortedData.length; i++) {
        sortedData[i].sortNo = i + 1
      }
      log.debug("题目排序完成",sortedData)
      this.validSubjects = sortedData
      return sortedData
    }
    //根据题号排序(升序)
    calculatePages(){
      var length = this.validSubjects.length
      for (var i = 0; i < length-1; i++) {
        var neighborDistance = this.validSubjects[i+1]['itemcoord']['x'] - this.validSubjects[i]['itemcoord']['x']
        if(neighborDistance > this.getMaxX()/3){
          this.pageCount++
        }
      }
      log.debug("一共",this.pageCount, "页")
    }

    async constructSubjects(){
      var length = this.validSubjects.length
      for (var i = 0; i < length; i++) {
        var subject = new Subject(this.validSubjects[i], this)
        await subject.init()
        this.subjectInfos.push(subject.getInfo())
      }
      log.debug("题目组装完成")
    }

}

module.exports = TestPaper
