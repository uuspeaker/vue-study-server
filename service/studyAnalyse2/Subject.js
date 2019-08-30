const log = require('../../util/log').getLogger("Subject");
const cos = require('../../util/cos.js')
const path = require('path');
const graphic = require('../../util/graphic')

//绘图时的坐偏移
const leftMargin = 10
//绘图时的右偏移移
const rightMargin = 10

class Subject{
  constructor(item, myTestPaper){
    this.item = item
    this.testPaper = myTestPaper
    this.imageUrl = ''
    this.area = []
    //this.content = []
    this.content = []
  }

  getX(){return this.item.getX()}
  getY(){return this.item.getY()}
  getYWithMargin(){return this.getY() - this.getTestPaper().getLineHeight()*0.2}
  getText(){return this.item.getText()}
  getTestPaper(){return this.testPaper}

  getWidth(){
    return (this.item.getRightX() - this.item.getX()) * 0.9
  }

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
    if(this.item.sortNo == this.getTestPaper().getSubjectCount()){
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
    var nextNo = this.item.getSortNo() + 1
    var nextItem = this.getTestPaper().getItem(nextNo)
    return new Subject(nextItem, this.getTestPaper())
  }

  //获取题目截图区域类型（1、和下一题在同一页；2，翻页；3，最后一题）
  getAreaType(){
    //若是最后一条数据则返回3
    if(this.isLastSubject()){
      return 3
    }
    //log.debug(this.getNextSubject().getY(),this.getTestPaper().getMinY())
    if(this.getNextSubject().getY() == this.getTestPaper().getMinY()){
      return 3
    }

    //若下一条数据的Y坐标更大表示在同一页，返回1
    if(this.getY() < this.getNextSubject().getY()){
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
    //log.info('areaType',areaType)
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
        X: this.getX(),
        Y: this.getYWithMargin(),
        width: this.getWidth(),
        height: this.getNextSubject().getY() - this.getYWithMargin()
      }
    ]
  }

  //计算翻页题目坐标
  calculateFlipOverArea(){
    this.area = [{//题目上半部分坐标
      X: this.getX(),
      Y: this.getYWithMargin(),
      width: this.getTestPaper().getMaxSubjectWidth(),
      height: this.getTestPaper().getMaxY() - this.getYWithMargin()
      },{//题目下半部分坐标
        X: this.getNextSubject().getX(),
        Y: this.getTestPaper().getMinY(),
        width: this.getWidth(),
        height: this.getNextSubject().getY() - this.getTestPaper().getMinY()
      }
    ]
  }

  //计算最后一题坐标
  calculateLastArea(){
    this.area = [{
      X: this.getX(),
      Y: this.getYWithMargin(),
      width: this.getWidth(),
      height: this.getTestPaper().getMaxY() - this.getYWithMargin()
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
    log.info('切图完成',this.item.getSortNo())
  }

  async drawNormal(){
    var sourceUrl = this.getTestPaper().getSourceUrl()
    var extname = path.extname(sourceUrl)
    var targetUrl = `${this.getTestPaper().getTargetDir()}/${this.item.getSortNo()}${extname}`
    //log.debug(`绘制题目`,targetUrl,this.area)
    await graphic.cut(sourceUrl, targetUrl, this.area[0].width + leftMargin + rightMargin, this.area[0].height, this.area[0].X - leftMargin, this.area[0].Y)
    var cosObject = await cos.putObject(targetUrl)
    this.imageUrl = cosObject.Location
  }

  async drawFlipOver(){
    var sourceUrl = this.getTestPaper().getSourceUrl()
    var extname = path.extname(sourceUrl)
    var targetUrl = `${this.getTestPaper().getTargetDir()}/${this.item.getSortNo()}${extname}`
    var tmpUrls = []
    for (var i = 0; i < this.area.length; i++) {
      var tmpTargetUrl = `${this.getTestPaper().getTargetDir()}/${this.item.getSortNo()}-${i}${extname}`
      tmpUrls.push(tmpTargetUrl)
      //log.debug(`绘制题目`,tmpTargetUrl,this.area[i])
      await graphic.cut(sourceUrl, tmpTargetUrl, this.area[i].width + leftMargin + rightMargin, this.area[i].height, this.area[i].X - leftMargin, this.area[i].Y)
    }
    //合并图片，并将原来多余的图片删除
    await graphic.combine(tmpUrls[0], tmpUrls[1], targetUrl)
    var cosObject = await cos.putObject(targetUrl)
    this.imageUrl = cosObject.Location
  }

  async drawLast(){
    await this.drawNormal()
  }

  calculateContent(){
    for (var i = 0; i < this.area.length; i++) {
      var testPaperLength = this.getTestPaper().getDataCount()
      for (var j = 0; j < testPaperLength; j++) {
        var lineData = this.getTestPaper().getLine(j)
        var lineObject = new Subject(lineData, this.getTestPaper())
        var offsetX = lineObject.getX() - this.area[i].X
        var inX = (offsetX >= 0 && offsetX <= this.area[i].width)
        var offsetY = lineObject.getY() - this.area[i].Y
        var inY = (offsetY >= 0 && offsetY < this.area[i].height)
        //log.debug('比较lineData',lineData, 'inX', inX, 'inY', inY)
        if(inX && inY){
          //this.content.push(lineObject)
          this.content.push(lineObject.getText())
        }
      }
    }
    log.debug(`sortNo${this.item.getSortNo()}内容提取完成`)
  }

}

module.exports = Subject
