const log = require('../../util/log').getLogger("TestPaper");
const path = require('path')
const uuid = require('uuid')
const fs = require('fs');
const Subject = require('./Subject')

class TestPaper{
    constructor(sourceUrl,sourceData){
      //log.debug("试卷原始数据",sourceData)
      this.targetDir = ''
      //原始图片地址
      this.sourceUrl = sourceUrl;
      //原始数据
      this.sourceData = sourceData.TextDetections;
      //每一行的高度
      this.lineHeight = 0
      //以数字开头的数据
      this.possibleSubjects = []
      //以数字开头的,X坐标对齐且数值正常的数据
      this.validSubjects = []
      //题目截图区域
      this.subjectPolygons = []
      //每道题完整内容
      this.subjectInfos = []
      //Ｘ轴匹配偏差（用于判断编号是否和其他编号匹配）
      this.xOffset = 0.02
      //最小匹配个数（达到这个值才判定为题目编号）
      this.matchAmount = 2
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
      this.calculatePaperStructure()
      this.extractPosibleSubject()
      this.extractValidSubject()
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
    getMinX(){return this.paperPolygon.minX}
    getMaxX(){return this.paperPolygon.maxX}
    getMinY(){return this.paperPolygon.minY}
    getMaxY(){return this.paperPolygon.maxY}
    getMargin(){return this.lineHeight * 0.6}
    getLine(lineNo){return this.sourceData[lineNo]}
    getSubjectCount(){return this.validSubjects.length}
    getDataCount(){return this.sourceData.length}
    getValidSubjects(){return this.validSubjects}
    getSubjectPolygons(){return this.subjectPolygons}
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
    calculatePaperStructure(){
      var length = this.sourceData.length
      for (var i = 0; i < length; i++) {
        if(i == 0){
          this.lineHeight = this.sourceData[0]['Polygon'][3]['Y'] - this.sourceData[0]['Polygon'][0]['Y']
        }
        //获取最大的X坐标
        if(this.paperPolygon.minX > this.sourceData[i]['Polygon'][0]['X']){
          this.paperPolygon.minX = this.sourceData[i]['Polygon'][0]['X']
        }
        if(this.paperPolygon.maxX < this.sourceData[i]['Polygon'][2]['X']){
          this.paperPolygon.maxX = this.sourceData[i]['Polygon'][2]['X']
        }
        if(this.paperPolygon.minY > this.sourceData[i]['Polygon'][0]['Y']){
          this.paperPolygon.minY = this.sourceData[i]['Polygon'][0]['Y']
        }
        if(this.paperPolygon.maxY < this.sourceData[i]['Polygon'][2]['Y']){
          this.paperPolygon.maxY = this.sourceData[i]['Polygon'][2]['Y']
        }
      }
      log.info("获取试卷坐标", this.paperPolygon)
    }

    //将可能的题目提取出来（规则：数字打头的）
    extractPosibleSubject(){
      //var regExp = /^\d+/;
      var regExp = this.getPrefix()
      var result = []
      var length = this.sourceData.length
      for (var i = 0; i < length; i++) {
        if(this.sourceData[i].Confidence < 60)continue
        var item = this.sourceData[i].DetectedText
        if(item.length < 5)continue
        //log.debug("开始解析",item)

    		var mathResult = item.match(regExp);
    		if(mathResult) {
    			this.sourceData[i].subjectNo = mathResult[0]
          result.push(this.sourceData[i])
    		}else{

        }
      }
      this.possibleSubjects = result
      log.info(`数字打头的题目共${result.length}条`)
    }

    //分析题目前缀
    getPrefix(){
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
        var matchTime = 0
        var length = this.sourceData.length
        for (var j = 0; j < length; j++) {
          if(this.sourceData[j].Confidence < 60)continue
          var item = this.sourceData[j].DetectedText
          if(item.length < 5)continue
          //log.debug("开始解析",item)
          var regExp = regExpArr[i];
          var mathResult = item.match(regExp);
          if(mathResult) {
            log.info("匹配",regExp,item)
            matchTime++
          }else{
          }
        }
        if(matchTime > maxMatchTime){
          regIndex = i
          maxMatchTime = matchTime
        }
        log.info("规则", regExpArr[i],"匹配",matchTime,"次")
      }
      log.info("匹配规则是", regExpArr[regIndex])
      return regExpArr[regIndex]
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
        //log.debug("开始解析",item)
        //去掉题目编号大于总长度的
        // if(item.subjectNo > length+10 || item.subjectNo == 0) {
        //   log.debug("剔除编号异常数据",item)
        //   continue
        // }
        //去掉坐标明显不对齐的
        var likeNum = 0  //记录有多少数据的X坐标和自己对齐
        for (var j = 0; j < length; j++) {
          //log.debug("开始剔除不对齐数据")
          var offset = item['Polygon'][0]['X'] - this.possibleSubjects[j]['Polygon'][0]['X']
          if(Math.abs(offset) < (this.paperPolygon.maxX * this.xOffset)) likeNum++
        }
        if(likeNum < this.matchAmount + 1) {
          log.debug("剔除X偏离数据",item)
          continue
        }
        result.push(this.possibleSubjects[i])
      }
      this.validSubjects = result
      log.info(`有效题目共${result.length}条：`, result)
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
        let itemLength = this.validSubjects[i]['Polygon'][1]['X'] - this.validSubjects[i]['Polygon'][0]['X']
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
        this.validSubjects[i].rankValue = this.validSubjects[i].Polygon[0].X * 2 +  this.validSubjects[i].Polygon[0].Y
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
        var neighborDistance = this.validSubjects[i+1].Polygon[0].X - this.validSubjects[i].Polygon[0].X
        if(neighborDistance > this.getMaxX()/5){
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
