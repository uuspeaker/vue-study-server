const log = require('../../util/log').getLogger("Subject");
const fs = require('fs');
const cos = require('../../util/cos.js')
const path = require('path');
const graphic = require('../../util/graphic')

//绘图时的坐偏移
const leftMargin = 10
//绘图时的右偏移移
const rightMargin = 10

class Subject{
  constructor(subjectData, myTestPaper){
    this.subjectData = subjectData
    this.testPaper = myTestPaper
    this.imageUrl = ''
    this.area = []
    //this.content = []
    this.content = []
    this.targetDir = `./test/tmp/${myTestPaper.getName()}`
  }

  getMinX(){return this.subjectData.Polygon[0].X}
  getMinY(){return this.subjectData.Polygon[0].Y}
  getTitle(){return this.subjectData.DetectedText}
  getTestPaper(){return this.testPaper}

  async init(){
    this.calculateArea()
    await this.cutImage()
    this.calculateContent()
  }

  getInfo(){
    return {
      imageUrl: this.imageUrl,
      content: this.content
    }
  }

  isLastSubject(){
    if(this.subjectData.sortNo == this.getTestPaper().getSubjectCount()){
      return true
    }else{
      return false
    }
  }

  //获取下一个题目对象
  getNextSubject(){
    //如果是最后一个题目
    if(this.isLastSubject()){
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
      throw '未知的题目类型，无法计算'
    }
    log.debug("计算题目坐标完成")
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

  async cutImage(){
    var areaType = this.getAreaType()
    if(areaType == 1){//正常区域
      await this.drawNormal()
    }else if(areaType == 2){//翻页题目
      await this.drawFlipOver()
    }else if(areaType == 3){//最后一题
      await this.drawLast()
    }
    log.info('切图完成',this.subjectData.sortNo)
  }

  mkdir(){
    fs.mkdir(this.targetDir,(result,err)=>{
      if(err){
        log.error('创建目录失败',this.targetDir,err)
      }
      log.error('创建目录成功',result)
    })
  }

  async drawNormal(){
    this.mkdir()
    var sourceUrl = this.getTestPaper().getSourceUrl()
    var extname = path.extname(sourceUrl)
    var targetUrl = `${this.targetDir}/${this.subjectData.sortNo}${extname}`
    //log.debug(`绘制题目`,targetUrl,this.area)
    await graphic.cut(sourceUrl, targetUrl, this.area[0].width + leftMargin + rightMargin, this.area[0].height, this.area[0].X - leftMargin, this.area[0].Y)
    var cosObject = await cos.putObject(targetUrl)
    this.imageUrl = cosObject.Location
  }

  async drawFlipOver(){
    this.mkdir()
    var sourceUrl = this.getTestPaper().getSourceUrl()
    var extname = path.extname(sourceUrl)
    var targetUrl = `${this.targetDir}/${this.subjectData.sortNo}${extname}`
    var tmpUrls = []
    for (var i = 0; i < this.area.length; i++) {
      var tmpTargetUrl = `${this.targetDir}/${this.subjectData.sortNo}-${i}${extname}`
      tmpUrls.push(tmpTargetUrl)
      //log.debug(`绘制题目`,tmpTargetUrl,this.area[i])
      await graphic.cut(sourceUrl, tmpTargetUrl, this.area[i].width + leftMargin + rightMargin, this.area[i].height, this.area[i].X - leftMargin, this.area[i].Y)
    }
    //合并图片，并将原来多余的图片删除
    await graphic.combine(tmpUrls[0], tmpUrls[1], targetUrl)
    var cosObject = await cos.putObject(targetUrl)
    this.imageUrl = cosObject.Location
  }

  savePicture(targetUrl){

  }

  drawLast(){
    this.drawNormal()
  }

  calculateContent(){
    this.calculateArea()

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
          this.content.push(lineObject.getTitle())
        }
      }
    }
    log.debug(`sortNo${this.subjectData.sortNo}内容提取完成`)
  }

}

module.exports = Subject
