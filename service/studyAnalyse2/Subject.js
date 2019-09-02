const log = require('../../util/log').getLogger("Subject");
const cos = require('../../util/cos.js')
const path = require('path');
const graphic = require('../../util/graphic')
const config = require('../../config/db')

//绘图时的坐偏移
const leftMargin = 10
//绘图时的右偏移移
const rightMargin = 10

class Subject{
  constructor(item, myTestPaper){
    //题目第一行的数据
    this.item = item
    this.testPaper = myTestPaper
    //原始图片路径
    this.imageUrl = ''
    //题目坐标区域
    this.area = []
    //题目完整内容
    this.content = []
    //切图缩进
    this.graphicWidthRate = 0.95
  }

  getX(){return this.item.getX()}
  getY(){return this.item.getY()}
  getYWithMargin(){return this.getY() - this.getTestPaper().getLineHeight()*0.2}
  getText(){return this.item.getText()}
  getTestPaper(){return this.testPaper}

  getWidth(){
    return (this.item.getRightX() - this.item.getX())
  }

  async init(){
    this.calculateArea()
    this.calculateContent()
    await this.cutImage()
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
    return this.item.getNext()
  }

  //获取题目截图区域类型（1、和下一题在同一页；2，翻页；3，最后一题）
  getAreaType(){
    return this.item.getType()
  }

  calculateArea(){
    var areaType = this.getAreaType()
    //log.info('areaType',areaType)
    if(areaType == config.NORMAL){//正常区域
      this.calculateNormalArea()
    }else if(areaType == config.FLIPOVER){//翻页题目
      this.calculateFlipOverArea()
    }else if(areaType == config.BOTTOM){//最后一题
      this.calculateLastArea()
    }else{
      throw '未知的题目类型，无法计算'
    }
    log.debug("计算题目坐标完成",this.area)
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
      width: this.getWidth(),
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
    if(areaType == config.NORMAL){//正常区域
      await this.drawNormal()
    }else if(areaType == config.FLIPOVER){//翻页题目
      await this.drawFlipOver()
    }else if(areaType == config.BOTTOM){//最后一题
      await this.drawLast()
    }
    log.info('切图完成',this.item.getSortNo())
  }

  async drawNormal(){
    var sourceUrl = this.getTestPaper().getSourceUrl()
    var extname = path.extname(sourceUrl)
    var targetUrl = `${this.getTestPaper().getTargetDir()}/${this.item.getSortNo()}${extname}`
    log.debug(`绘制题目`,targetUrl,this.area)
    await graphic.cut(sourceUrl, targetUrl, this.ggetGraphicWidth() + leftMargin + rightMargin, this.area[0].height, this.area[0].X - leftMargin, this.area[0].Y)
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
      await graphic.cut(sourceUrl, tmpTargetUrl, this.ggetGraphicWidth() + leftMargin + rightMargin, this.area[i].height, this.area[i].X - leftMargin, this.area[i].Y)
    }
    //合并图片，并将原来多余的图片删除
    await graphic.combine(tmpUrls[0], tmpUrls[1], targetUrl)
    var cosObject = await cos.putObject(targetUrl)
    this.imageUrl = cosObject.Location
  }

  //如果是最后一页前面的，
  getGraphicWidth(width){
    //如果是最后一页，切图时按计算出来的宽度
    if(this.item.getMaxPage() == 1 || this.item.getMaxPage == this.item.getPage()){
      return this.item.getWidth()
    }else{//若不是，为避免切到无关的内容，缩进少许
      return this.item.getWidth() * this.graphicWidthRate
    }
  }

  async drawLast(){
    await this.drawNormal()
  }

  calculateContent(){
    for (var i = 0; i < this.area.length; i++) {
      var testPaperCount = this.getTestPaper().getDataCount()
      //若内容起点X坐标在itmu范围之内,在放到这个题目下面
      for (var j = 0; j < testPaperCount; j++) {
        var lineData = this.getTestPaper().getLine(j)
        //允许题目稍稍超出题目坐标范围
        var promisedOffsetRate = 1.1
        var offsetLeftXInArea = (lineData.getX() - this.area[i].X + this.area[i].width * promisedOffsetRate >= 0)
        var offsetRightXInArea = lineData.getX() + lineData.getWidth() > this.area[i].X && lineData.getX() + lineData.getWidth() < this.area[i].X + this.area[i].width
        var inX = (offsetLeftXInArea && offsetRightXInArea)
        var offsetY = lineData.getY() - this.area[i].Y
        var inY = (offsetY >= 0 && offsetY < this.area[i].height)
        if(inX && inY){
          //this.content.push(lineObject)
          this.content.push(lineData.getText())
        }
      }
    }
    log.debug(`sortNo${this.item.getSortNo()}内容提取完成`)
  }

}

module.exports = Subject
