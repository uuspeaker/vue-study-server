const log = require('../util/log').getLogger("ItemAnalyser");
const graphic = require('../util/graphic')
const path = require('path')

class ItemAnalyser{
    constructor(sourceData){
      //log.debug("试卷原始数据",sourceData)
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
      this.maxX = 0
      this.maxY = 0
      this.minY = 0
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
      var length = this.sourceData.length
      log.debug("开始提取题目（规则：数字打头的），数据总条数",length)
      for (var i = 0; i < length; i++) {
        //获取最大的X坐标
        if(this.maxX < this.sourceData[i]['Polygon'][1]['X']){
          this.maxX = this.sourceData[i]['Polygon'][1]['X']
        }
        if(this.maxY < this.sourceData[i]['Polygon'][2]['Y']){
          this.maxY = this.sourceData[i]['Polygon'][2]['Y']
        }
        if(this.minY > this.sourceData[i]['Polygon'][2]['Y']){
          this.minY = this.sourceData[i]['Polygon'][2]['Y']
        }
        var item = this.sourceData[i].DetectedText
        //log.debug("开始解析",item)
        var regExp = /^\d+/;
    		var mathResult = item.match(regExp);
    		if(mathResult) {
    			this.sourceData[i].itemNo = mathResult[0]*1
          result.push(this.sourceData[i])
    		}else{

        }
      }
      this.possibleItems = result
      log.debug(`提取结束（规则：数字打头的），共${result.length}条，数据详情：possibleItems`,result)
    }

    //将有效的题目提取出来（规则：X坐标对齐的）
    extractValidItem(){
      var result = []
      var length = this.possibleItems.length
      log.debug("开始提取题目（规则：X坐标对齐的），数据总条数",length)
      for (var i = 0; i < length; i++) {
        var item = this.possibleItems[i]
        //log.debug("开始解析",item)
        //去掉题目编号大于总长度的
        if(item.itemNo > length+10 || item.itemNo == 0) {
          log.debug("剔除编号异常数据",item)
          continue
        }
        //去掉坐标明显部对齐的
        var likeNum = 0  //记录有多少数据的X坐标和自己对齐
        for (var j = 0; j < length; j++) {
          //log.debug("开始剔除不对齐数据")
          var offset = item['Polygon'][0]['X'] - this.possibleItems[j]['Polygon'][0]['X']
          if(Math.abs(offset) < (this.maxX/20)) likeNum++
        }
        if(likeNum <= 3) {
          log.debug("剔除X偏离数据",item)
          continue
        }
        result.push(this.possibleItems[i])
      }
      this.validItems = result
      log.debug(`提取结束（规则：X坐标对齐的），共${result.length}条，数据详情：validItems`,result)
    }

    //计算题目最大长度
    initMaxItemLength(){
      log.debug("开始计算最大题目长度")
      var itemLengths = []
      var totalLength = 0
      var itemMaxWidth = 0
      var itemMinX = 1000000
      var itemMaxX = 0
      var length = this.validItems.length
      for (var i = 0; i < length; i++) {
        //log.debug(`解析第${i+1}条数据`,this.validItems[i])
        let itemLength = this.validItems[i]['Polygon'][1]['X'] - this.validItems[i]['Polygon'][0]['X']
        itemLengths.push(itemLength)
        totalLength += itemLength
        // if(itemLength > itemMaxWidth){
        //   itemMaxWidth = itemLength
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
       var checkMaxLength = itemAvgLength * 2
       for (var i = 0; i < itemLengths.length; i++) {
         if(itemLengths[i] > validMaxLength && itemLengths[i] < checkMaxLength){
           validMaxLength = itemLengths[i]
         }
       }
      // var testPaperLength = itemMaxX - itemMinX
      this.itemMaxWidth = validMaxLength
      log.debug("计算最大题目长度结束，最大长度为:itemMaxWidth",validMaxLength)
    }


    //根据题号排序(升序)
    sortItem(){
      log.debug("开始给题目排序")
      var sortedData = this.validItems.sort((a,b) => {
        return a.itemNo - b.itemNo
      })
      for (var i = 0; i < sortedData.length; i++) {
        sortedData[i].orderNo = i
      }
      log.debug("排序结束",sortedData)
      this.validItems = sortedData
      return sortedData
    }

    //计算每道题的坐标
    analyseItemPolygon(){
      log.debug("开始计算题目坐标")
      var itemPolygons = []
      var length = this.validItems.length
      for (var i = 0; i < length-1; i++) {
        //log.debug(`解析第${i+1}条数据`,this.validItems[i])
        //如果下一题的Y坐标更小，表示题目有翻页，需要特殊处理（讲前半截和后半截分别提取出来，待切图时合并）
        var itemHeight = this.validItems[i+1]['Polygon'][0].Y - this.validItems[i]['Polygon'][0].Y
        if(itemHeight < 0 ){

          var itemPolygon = [{//题目上半部分坐标
              X: this.validItems[i]['Polygon'][0].X - 10,
              Y: this.validItems[i]['Polygon'][0].Y ,
              width: this.itemMaxWidth + 20,
              height: this.maxY - this.validItems[i]['Polygon'][0].Y
            },{//题目下半部分坐标
              X: this.validItems[i+1]['Polygon'][0].X - 10,
              Y: this.minY,
              width: this.itemMaxWidth + 20,
              height: this.validItems[i+1]['Polygon'][0].Y - this.minY
            }
          ]
          itemPolygons.push({
            itemNo: this.validItems[i].itemNo,
            itemPolygon: itemPolygon
          })
        }else{
          var itemPolygon = [{
              X: this.validItems[i]['Polygon'][0].X - 10,
              Y: this.validItems[i]['Polygon'][0].Y ,
              width: this.itemMaxWidth + 20,
              height: itemHeight
            }
          ]
          itemPolygons.push({
            itemNo: this.validItems[i].itemNo,
            itemPolygon: itemPolygon
          })
        }
      }

      //最后一行没有下一行参照，故取最大Y坐标计算高度
      var itemPolygonLast = [{
        X: this.validItems[length-1]['Polygon'][0].X -10,
        Y: this.validItems[length-1]['Polygon'][0].Y ,
        width: this.itemMaxWidth + 20,
        height: this.maxY - this.validItems[length-1]['Polygon'][0].Y
      }]
      itemPolygons.push({
        itemNo: this.validItems[i].itemNo,
        itemPolygon: itemPolygonLast
      })

      this.itemPolygons = itemPolygons
      log.debug(`计算坐标结束，共有${itemPolygons.length}条坐标，数据详情：itemPolygons`,itemPolygons)
    }

    //计算最后一道题的坐标
    analyseLastItemPolygon(){

    }

    //填充每道题的内容
    analyseItemContent(){
      itemContent
    }
    //填充每道题的内容
    async cutPaper(sourceUrl, targetDir){
      var extname = path.extname(sourceUrl)
      var length = this.itemPolygons.length
      //log.debug(this.itemPolygons)
      for (var i = 0; i < length; i++) {
        var item = this.itemPolygons[i]
        log.debug(`【切图】解析第${i+1}条数据`,item)

          var partItem = item.itemPolygon
          if(this.itemPolygons[i].itemPolygon.length == 1){//若只有一张图片，直接切图
            var targetUrl = `${targetDir}/${item.itemNo}${extname}`
            graphic.cut(sourceUrl, targetUrl, partItem[0].width, partItem[0].height, partItem[0].X, partItem[0].Y)
          }else{//若超过一张图片，切图后合并
            var targetUrl = `${targetDir}/${item.itemNo}${extname}`
            var tmpUrls = []
            for (var j = 0; j < item.itemPolygon.length; j++) {
              var tmpTargetUrl = `${targetDir}/${item.itemNo}${j}${extname}`
              tmpUrls.push(tmpTargetUrl)
              await graphic.cut(sourceUrl, tmpTargetUrl, partItem[j].width, partItem[j].height, partItem[j].X, partItem[j].Y)
            }
            //合并图片，并将原来多余的图片删除
            graphic.combine(tmpUrls[0], tmpUrls[1], targetUrl)
          }

      }

    }

}
 module.exports = ItemAnalyser
