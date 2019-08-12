const log = require('../../util/log').getLogger("Subject");
var fs = require('fs');
var path = require('path');
const graphic = require('../../util/graphic')

//绘图时的坐偏移
const leftMargin = 10
//绘图时的右偏移移
const rightMargin = 10
var testPaper

class Subject{
  constructor(subjectData, myTestPaper){
    this.subjectData = subjectData
    testPaper = myTestPaper
    this.area = []
    //this.content = []
    this.contentStr = []
  }

  getMinX(){return this.subjectData.Polygon[0].X}
  getMinY(){return this.subjectData.Polygon[0].Y}
  getTitle(){return this.subjectData.DetectedText}
  getTestPaper(){return testPaper}

  isLastSubject(){
    if(this.subjectData.sortNo == this.getTestPaper().getSubjectCount()){
      return true
    }else{
      return false
    }
  }

  //获取下一个题目对象
  getNextSubject(){
    if(this.isLastSubject()){
      log.error('已经是最后一个题目，无法获取下一条')
      return undefined
    }
    var nextNo = this.subjectData.sortNo + 1
    var nextSubjectData = this.getTestPaper().getSubjectData(nextNo)
    return new Subject(nextSubjectData, this.getTestPaper())
  }

  //获取题目截图区域类型（1、和下一题在同一页；2，翻页；3，最后一题）
  getAreaType(){
    //若是最后一条数据则返回3
    if(this.isLastSubject()){
      return 3
    }
    var nextNo = this.subjectData.sortNo + 1
    var nextSubjectData = this.getTestPaper().getSubjectData(nextNo)
    //若吓一跳数据的Y坐标更大表示在同一页，返回1
    if(this.getMinY() < this.getNextSubject().getMinY()){
      return 1
    }else{
      return 2
    }

  }

  calculateArea(){
    if(this.area.length > 0){
      //log.info('已经计算过题目区域，不再重复计算')
      return
    }
    var areaType = this.getAreaType()
    if(areaType == 1){//正常区域
      this.calculateNormalArea()
    }else if(areaType == 2){//翻页题目
      this.calculateFlipOverArea()
    }else if(areaType == 3){//最后一题
      this.calculateLastArea()
    }else{
      log.error('未知的题目区域类型，无法计算',areaType)
    }
    log.debug("计算题目坐标区域完成")
  }

  //计算正常题目坐标
  calculateNormalArea(){
    this.area = [{
        X: this.getMinX(),
        Y: this.getMinY(),
        width: this.getTestPaper().getMaxSubjectWidth(),
        height: this.getNextSubject().getMinY() - this.getMinY()
      }
    ]
  }

  //计算翻页题目坐标
  calculateFlipOverArea(){
    this.area = [{//题目上半部分坐标
      X: this.getMinX(),
      Y: this.getMinY(),
      width: this.getTestPaper().getMaxSubjectWidth(),
      height: this.getTestPaper().getMaxY() - this.getMinY()
      },{//题目下半部分坐标
        X: this.getNextSubject().getMinX(),
        Y: this.getTestPaper().getMinY(),
        width: this.getTestPaper().getMaxSubjectWidth(),
        height: this.getNextSubject().getMinY() - this.getTestPaper().getMinY()
      }
    ]
  }

  //计算最后一题坐标
  calculateLastArea(){
    this.area = [{
      X: this.getMinX(),
      Y: this.getMinY(),
      width: this.getTestPaper().getMaxSubjectWidth(),
      height: this.getTestPaper().getMaxY() - this.getMinY()
      }
    ]
  }

  draw(targetDir){
    this.calculateArea()
    log.debug("开始切图")
    var areaType = this.getAreaType()
    if(areaType == 1){//正常区域
      this.drawNormal(targetDir)
    }else if(areaType == 2){//翻页题目
      this.drawFlipOver(targetDir)
    }else if(areaType == 3){//最后一题
      this.drawLast(targetDir)
    }
  }

  mkdir(targetDir){
    fs.mkdir(targetDir,(result,err)=>{
      if(err){
        log.error('创建目录失败',targetDir,err)
      }
    })
  }

  drawNormal(targetDir){
    this.mkdir(targetDir)
    var sourceUrl = this.getTestPaper().getSourceUrl()
    var extname = path.extname(sourceUrl)
    var targetUrl = `${targetDir}/${this.subjectData.sortNo}${extname}`
    log.debug(`绘制题目`,targetUrl,this.area)
    graphic.cut(sourceUrl, targetUrl, this.area[0].width + leftMargin + rightMargin, this.area[0].height, this.area[0].X - leftMargin, this.area[0].Y)
  }

  async drawFlipOver(targetDir){
    this.mkdir(targetDir)
    var sourceUrl = this.getTestPaper().getSourceUrl()
    var extname = path.extname(sourceUrl)
    var targetUrl = `${targetDir}/${this.subjectData.sortNo}${extname}`
    var tmpUrls = []
    for (var i = 0; i < this.area.length; i++) {
      var tmpTargetUrl = `${targetDir}/${this.subjectData.sortNo}-${i}${extname}`
      tmpUrls.push(tmpTargetUrl)
      log.debug(`绘制题目`,tmpTargetUrl,this.area[i])
      await graphic.cut(sourceUrl, tmpTargetUrl, this.area[i].width + leftMargin + rightMargin, this.area[i].height, this.area[i].X - leftMargin, this.area[i].Y)
    }
    //合并图片，并将原来多余的图片删除
    graphic.combine(tmpUrls[0], tmpUrls[1], targetUrl)
  }

  drawLast(targetDir){
    this.drawNormal(targetDir)
  }

  extractContent(){
    this.calculateArea()
    log.debug(`开始提取sortNo${this.subjectData.sortNo}的内容`)
    for (var i = 0; i < this.area.length; i++) {
      var testPaperLength = this.getTestPaper().getDataCount()
      for (var j = 0; j < testPaperLength; j++) {
        var lineData = this.getTestPaper().getLine(j)
        var lineObject = new Subject(lineData, this.getTestPaper())
        var offsetX = lineObject.getMinX() - this.area[i].X
        var inX = (offsetX >= 0 && offsetX <= this.area[i].width)
        var offsetY = lineObject.getMinY() - this.area[i].Y
        var inY = (offsetY >= 0 && offsetY < this.area[i].height)
        //log.debug('比较lineData',lineData, 'inX', inX, 'inY', inY)
        if(inX && inY){
          //this.content.push(lineObject)
          this.contentStr.push(lineObject.getTitle())
        }
      }
    }
  }

  print(){
    if(this.contentStr.length == 0){
      this.extractContent()
    }
    log.debug('题目内容为',this.contentStr)
  }


}

module.exports = Subject
