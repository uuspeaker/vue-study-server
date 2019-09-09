const log = require('../../util/log').getLogger("SubjectBuilder");
const cos = require('../../util/cos.js')
const path = require('path');
const graphic = require('../../util/graphic')
const config = require('../../config/db')
const SubjectAnswer = require('./SubjectAnswer')

class Subject{
  constructor(url, content, answer){
    this.imageUrl = url
    this.content = content
    this.answer = answer
  }
}

class SubjectBuilder{
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
    //题目答案
    this.answer = []
    //绘图时的坐偏移
    this.leftMargin = myTestPaper.getLineHeight()
    //绘图时的右偏移移
    this.rightMargin = 0
    //X轴偏差率低于此值得当作题目的内容
    this.promisedOffsetRate = 0.2
  }

  getX(){return this.item.getX()}
  getY(){return this.item.getY()}
  getYWithMargin(){return this.getY() - this.getTestPaper().getLineHeight()*0.2}
  getText(){return this.item.getText()}
  getTestPaper(){return this.testPaper}

  getWidth(){
    return (this.item.getRightX() - this.item.getX())
  }

  async getSubject(){
    this.calculateArea()
    this.calculateContent()
    await this.extractAnswer()
    await this.cutImage()
    return new Subject(this.imageUrl,this.content,this.answer)
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
    if(areaType == config.item.normal){//正常区域
      this.calculateNormalArea()
    }else if(areaType == config.item.flipover){//翻页题目
      this.calculateFlipOverArea()
    }else if(areaType == config.item.bottom){//最后一题
      this.calculateLastArea()
    }else{
      throw '未知的题目类型，无法计算'
    }
    log.debug(`sortNo${this.item.getSortNo()}坐标计算完成`,this.area)
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
    if(areaType == config.item.normal){//正常区域
      await this.drawNormal()
    }else if(areaType == config.item.flipover){//翻页题目
      await this.drawFlipOver()
    }else if(areaType == config.item.bottom){//最后一题
      await this.drawLast()
    }
    log.info(`sortNo${this.item.getSortNo()}切图完成`,this.item.getSortNo())
  }

  async drawNormal(){
    var sourceUrl = this.getTestPaper().getSourceUrl()
    var extname = path.extname(sourceUrl)
    var targetUrl = `${this.getTestPaper().getTargetDir()}/${this.item.getSortNo()}${extname}`
    log.debug(`绘制题目`,targetUrl,this.area)
    await graphic.cut(sourceUrl, targetUrl, this.getGraphicWidth() + this.leftMargin + this.rightMargin, this.area[0].height, this.area[0].X - this.leftMargin, this.area[0].Y)
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
      await graphic.cut(sourceUrl, tmpTargetUrl, this.getGraphicWidth() + this.leftMargin + this.rightMargin, this.area[i].height, this.area[i].X - this.leftMargin, this.area[i].Y)
    }
    //合并图片，并将原来多余的图片删除
    await graphic.combine(tmpUrls[0], tmpUrls[1], targetUrl)
    var cosObject = await cos.putObject(targetUrl)
    this.imageUrl = cosObject.Location
  }

  //如果是最后一页前面的，
  getGraphicWidth(width){
    //如果是最后一页，为避免某些非字符内容超出题目宽度，切图时延伸一个字的宽度
    if(this.item.getMaxPage() == this.item.getPage()){
      return this.getWidth() + this.getTestPaper().getLineHeight()
    }else{//若不是，为避免切到无关的内容，缩进一个字的距离
      return this.getWidth() - this.getTestPaper().getLineHeight()
    }
  }

  async drawLast(){
    await this.drawNormal()
  }

  calculateContent(){
    var leftMargin = 0
    for (var i = 0; i < this.area.length; i++) {
      var testPaperCount = this.getTestPaper().getDataCount()
      //若内容起点X坐标在itmu范围之内,在放到这个题目下面
      for (var j = 0; j < testPaperCount; j++) {
        var lineData = this.getTestPaper().getLine(j)
        //允许内容稍稍超出题目坐标范围
        var leftXInArea = ((lineData.getX() - this.area[i].X + this.area[i].width * this.promisedOffsetRate) >= 0)
        var rightXInArea = lineData.getX() + lineData.getWidth() > this.area[i].X && lineData.getX() + lineData.getWidth() < this.area[i].X + this.area[i].width
        var inX = (leftXInArea && rightXInArea)
        var offsetY = lineData.getY() - this.area[i].Y
        var inY = (offsetY >= 0 && offsetY < this.area[i].height)
        if(inX && inY){
          //this.content.push(lineObject)
          this.content.push(lineData.getText())
          var leftMargin = this.area[i].X - lineData.getX()
          if(this.leftMargin < (this.area[i].X - lineData.getX())){
            this.leftMargin = this.area[i].X - lineData.getX()
          }
        }
      }
    }
    log.info(`sortNo${this.item.getSortNo()}内容提取完成`,this.content)
  }

  async extractAnswer(){
    var analyser = new SubjectAnswer(this.content)
    this.answer = await analyser.getAnswer()
    log.info(`sortNo${this.item.getSortNo()}答案提取完成`,this.answer)
  }

}

module.exports = SubjectBuilder
