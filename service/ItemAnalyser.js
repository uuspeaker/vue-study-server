const log = require('../util/log').getLogger("ItemAnalyser");

class ItemAnalyser{
    constructor(sourceData){
      log.debug("试卷原始数据",sourceData)
      //原始数据
      this.sourceData = sourceData.result.TextDetections;
      //处理后数据,增加:sortNo题目编号,
      this.decoratedData = [];
      //以数字开头的数据
      this.possibleItems = [];
      //以数字开头的且X坐标整齐的数据
      this.validItems = [];
      //题目截图区域
      this.itemPolygons = []
      //每道题完整内容
      this.itemContent = []
    }

    analyse(){
      this.extractPosibleItem()
      this.extractValidItem()
      this.initMaxItemLength()
      this.sortItem()
      this.analyseItemPolygon()
      //this.analyseLastitemPolygon()
    }

    //将可能的题目提取出来（规则：数字打头的）
    extractPosibleItem(){
      var result = []
      var length = this.sourceData.length - 1
      log.debug("开始提取题目（规则：数字打头的），数据总条数",length)
      for (var i = 0; i < length; i++) {
        var item = this.sourceData[i].DetectedText
        log.debug("开始解析",item)

        var regExp = /^\d+/;
    		var mathResult = item.match(regExp);
    		if(mathResult) {
    			this.sourceData[i].itemNo = mathResult[0]*1
          result.push(this.sourceData[i])
    		}else{

        }
      }
      this.possibleItems = result
      log.debug(`提取结束（规则：数字打头的），共${result.length}条，数据详情：`,result)
    }
    //将有效的题目提取出来（规则：X坐标对齐的）
    extractValidItem(){
      var result = []
      var length = this.sourceData.length - 1
      log.debug("开始提取题目（规则：X坐标对齐的），数据总条数",length)
      for (var i = 0; i < length; i++) {
        var item = this.sourceData[i].DetectedText
        log.debug("开始解析",item)

        var regExp = /^\d+/;
    		var mathResult = item.match(regExp);
    		if(mathResult) {
    			this.sourceData[i].itemNo = mathResult[0]*1
          result.push(this.sourceData[i])
    		}else{

        }
      }
      this.validItems = result
      log.debug(`提取结束（规则：X坐标对齐的），共${result.length}条，数据详情：`,result)
    }

    //计算题目最大长度
    initMaxItemLength(){
      log.debug("开始计算最大题目长度")
      var itemLengths = []
      var totalLength = 0
      var itemMaxLength = 0
      var itemMinX = 1000000
      var itemMaxX = 0
      var length = this.validItems.length
      for (var i = 0; i < length; i++) {
        log.debug(`解析第${i+1}条数据`,this.validItems[i])
        let itemLength = this.validItems[i]['Polygon'][1]['X'] - this.validItems[i]['Polygon'][0]['X']
        itemLengths.push(itemLength)
        totalLength += itemLength
        // if(itemLength > itemMaxLength){
        //   itemMaxLength = itemLength
        // }
        // if(itemMinX > this.validItems[i]['Polygon'][0]['X']){
        //   itemMinX = this.validItems[i]['Polygon'][0]['X']
        // }
        // if(itemMaxX < this.validItems[i]['Polygon'][1]['X']){
        //   itemMaxX = this.validItems[i]['Polygon'][1]['X']
        // }
      }
      var validMaxLength = 0
       var itemAvgLength = totalLength/(length+1)
       var checkMaxLength = itemAvgLength * 1.5
       for (var i = 0; i < itemLengths.length; i++) {
         if(itemLengths[i] > validMaxLength && itemLengths[i] < checkMaxLength){
           validMaxLength = itemLengths[i]
         }
       }
      // var testPaperLength = itemMaxX - itemMinX
      this.itemMaxLength = validMaxLength
      log.debug("计算最大题目长度结束，最大长度为",validMaxLength)
    }


    //根据题号排序(升序)
    sortItem(){
      log.debug("开始给题目排序")
      var sortedData = this.validItems.sort((a,b) => {
        return a.itemNo - b.itemNo
      })
      log.debug("排序结束",sortedData)
      this.validItems = sortedData
      return sortedData
    }

    //计算每道题的坐标
    analyseItemPolygon(){
      log.debug("开始计算题目坐标")
      var itemPolygons = []
      var length = this.validItems.length - 1
      for (var i = 0; i < length; i++) {
        log.debug(`解析第${i+1}条数据`,this.validItems[i])
        var itemPolygon = {
          itemNo: this.validItems[i].itemNo,
          leftX: this.validItems[i]['Polygon'][0].X,
          leftY: this.validItems[i]['Polygon'][0].Y,
          rightX: this.validItems[i]['Polygon'][0].X + this.itemMaxLength,
          rightY: this.validItems[i+1]['Polygon'][2].Y
        }
        itemPolygons.push(itemPolygon)
      }
      this.itemPolygons = itemPolygons
      log.debug(`计算坐标结束，共有${itemPolygons.length}条坐标，数据详情：`,itemPolygons)
    }

    //计算最后一道题的坐标
    analyseLastItemPolygon(){

    }

    //填充每道题的内容
    analyseItemContent(){
      itemContent
    }

}
 module.exports = ItemAnalyser
