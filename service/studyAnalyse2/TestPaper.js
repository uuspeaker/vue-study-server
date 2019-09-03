const log = require('../../util/log').getLogger("TestPaper");
const path = require('path')
const uuid = require('uuid')
const fs = require('fs');
const Subject = require('./Subject')
const SubjectAnalyser = require('./SubjectAnalyser')
const Item = require('./Item')
const config = require('../../config/db')

class TestPaper{
    constructor(sourceUrl,sourceData){
      //log.debug("试卷原始数据",sourceData)
      this.targetDir = ''
      //原始图片地址
      this.sourceUrl = sourceUrl;
      //原始数据
      this.sourceData = sourceData;
      //处理后数据
      this.allItems = [];
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
      this.initItems()
      this.deleteHeadAndFoot()
      this.initPaperStructure()
      this.initValidSubjects()
      await this.mkdir()
      await this.constructSubjects()
    }

    getTargetDir(){return this.targetDir}
    getSourceUrl(){return this.sourceUrl}
    getSourceData(){return this.sourceData}
    getItems(){return this.allItems}
    getMinX(){return this.paperPolygon.minX}
    getMaxX(){return this.paperPolygon.maxX}
    getMinY(){return this.paperPolygon.minY}
    getMaxY(){return this.paperPolygon.maxY}
    getLineHeight(){return this.lineHeight}
    getLine(lineNo){return this.allItems[lineNo]}
    getSubjectCount(){return this.validSubjects.length}
    getDataCount(){return this.allItems.length}
    getValidSubjects(){return this.validSubjects}
    getSubjectInfos(){return this.subjectInfos}
    getPaperPolygon(){return this.paperPolygon}
    getMaxSubjectWidth(){return this.maxSubjectWidth}

    getItem(sortNo){
      if(sortNo && sortNo >= 1 && sortNo <= this.validSubjects.length){
        return this.validSubjects[sortNo-1]
      }else{
        log.info(`编号输入错误，请输入1-${this.validSubjects.length}范围内的编号，实际输入${sortNo}`)
      }
    }

    //计算试卷结构数据，包括坐标
    deleteHeadAndFoot(){
      var length = this.allItems.length
      var hasDeleteLast = false
      for (var i = length -1; i > 0; i--) {
        var regExp = /共\d{1,2}页/;
        var regExp2 = /第\d{1,2}页/;
        var item = this.allItems[i].getText()
        var mathResult = item.match(regExp) || item.match(regExp2);
        if(mathResult){
          log.info(`清理掉${this.allItems[i].getText()}`)
          this.allItems.pop()
          hasDeleteLast = true
        }else{
          if(hasDeleteLast)return
        }
      }
    }

    initItems(){
      for (var index in this.sourceData) {
        delete this.sourceData[index]['words']
        delete this.sourceData[index]['candword']
        this.allItems.push(new Item(this.sourceData[index]))
      }
      log.debug('this.allItems',this.allItems)
    }

    //计算试卷结构数据，包括坐标
    initPaperStructure(){
      var length = this.allItems.length
      log.debug('length',length)
      for (var i = 0; i < length; i++) {
        // delete this.sourceData[i]['words']
        // delete this.sourceData[i]['candword']
        if(i == 0){
          this.lineHeight = this.allItems[0].getHeight()
          log.debug("lineHeight", this.lineHeight)
        }
        //获取最大的X坐标
        if(this.paperPolygon.minX > this.allItems[i].getX()){
          this.paperPolygon.minX = this.allItems[i].getX()
        }
        if(this.paperPolygon.maxX < this.allItems[i].getX() + this.allItems[i].getWidth()){
          this.paperPolygon.maxX = this.allItems[i].getX() + this.allItems[i].getWidth()
        }
        if(this.paperPolygon.minY > this.allItems[i].getY()){
          this.paperPolygon.minY = this.allItems[i].getY()
        }
        //var regExp = /^*第\d{1,2}页*共\d{1,2}页/;
        if(this.paperPolygon.maxY < this.allItems[i].getY() + this.allItems[i].getHeight()){
          this.paperPolygon.maxY = this.allItems[i].getY() + this.allItems[i].getHeight()
        }
      }
      log.info("获取试卷坐标", this.paperPolygon)
    }

    //分析题目
    initValidSubjects(){
      var regExpArr = []
      regExpArr.push(/^\.{0,1}\d{1,2}\D+/)//小写数字
      regExpArr.push(/^\.{0,1}\(|（\d{1,2}\(|（/) //带括号小写数字
      regExpArr.push(/^\.{0,1}\[一二三四五六七八九十]{1,2}/)//大写数字
      regExpArr.push(/^\.{0,1}\(|（[一二三四五六七八九十]{1,2}\(|（/)//带括号大写数字
      regExpArr.push(/^\.{0,1}\[a-z]{1,2}/)//小写字母
      regExpArr.push(/^\.{0,1}\(|（\[a-z]{1,2}\(|（/) //带括号小写字母
      regExpArr.push(/^\.{0,1}\[ⅠⅡⅢⅤ]{1,2}/)//希腊字母
      regExpArr.push(/^\.{0,1}\(|（\[ⅠⅡⅢⅤ]{1,2}\(|（/) //带括号希腊字母
      regExpArr.push(/^\.{0,1}\[①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳❶❷❸❹❺❻❼❽❾❿]{1,2}/)//带圈数字
      var regIndex = 0
      var maxMatchTime = 0
      for (var i = 0; i < regExpArr.length; i++) {
        log.debug('regExpArr[i]',regExpArr[i])
        var matchTime = 0
        var subjectAnalyser = new SubjectAnalyser(this, regExpArr[i])

        subjectAnalyser.execute()
        if(subjectAnalyser.getSubjectAmount() > maxMatchTime){
          regIndex = i
          maxMatchTime = subjectAnalyser.getSubjectAmount()
          this.validSubjects = subjectAnalyser.getSubjectHeads()
        }
        //若规则已经找出10条以上，为提升性能，跳过其他规则
        if(subjectAnalyser.getSubjectAmount() >= 10)break
        //如果没有找到任何题目,则将所有内容当作一个题目
      }
      if(subjectAnalyser.getSubjectAmount() == 0){
        var item = this.getLine(0)
        log.info('有找到任何题目,则将所有内容当作一个题目',item)
        item.item.itemcoord.x = this.getMinX()
        item.setSortNo(1)
        item.setPage(1)
        item.setMaxPage(1)
        item.setType(config.BOTTOM)
        item.setRightX(this.getMaxX())
        this.validSubjects = [item]
      }
      log.info("匹配规则是", regExpArr[regIndex])
      return regExpArr[regIndex]
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
