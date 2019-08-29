const log = require('../../util/log').getLogger("HeadAnalyser");
const config = require('../../config/db')
const path = require('path')
const uuid = require('uuid')
const fs = require('fs');
const ItemGroup = require('./ItemGroup')

class HeadAnalyser{
    constructor(testPaper, regExp){
      //要匹配的正则表达式
      this.regExp = regExp
      //原始数据
      this.testPaper = testPaper;
      //原始数据
      this.allItems = testPaper.getItems();
      //以数字开头的数据
      this.possibleSubjects = []
      //以数字开头的,X坐标对齐且数值正常的数据
      this.subjectHeads = []
      //Ｘ轴匹配偏差（用于判断编号是否和其他编号匹配）
      this.minItemAmount = 2
      //题目最小长度
      this.minLength = 5
      //X坐标偏差率
      this.xOffsetRate = 0.02
      //页数
      this.page = 0
    }

    execute(){
      this.extractByRegExp()
      this.clearInvalid()
      this.groupByX()
    }

    getSubjectHeads(){return this.subjectHeads}
    getSubjectAmount(){return this.subjectHeads.length}
    getPageAmount(){return this.page}

    //将可能的题目提取出来
    extractByRegExp(){
      var result = []
      var length = this.allItems.length
      for (var i = 0; i < length; i++) {
        var item = this.allItems[i].getText()

    		var mathResult = item.match(this.regExp);
    		if(mathResult) {
    			this.allItems[i].setSubjectNo(mathResult[0])
          result.push(this.allItems[i])
    		}
      }
      this.possibleSubjects = result
      log.info(`和正则表达式${this.regExp}匹配的题目共${result.length}条`)
    }

    clearInvalid(){
      var result = []
      var length = this.possibleSubjects.length
      for (var i = 0; i < length; i++) {
        var item = this.possibleSubjects[i].getText()
        //若长度小于5，不当做题目
        if(item.length < this.minLength){
          log.info(`剔除长度小于${this.minLength}的`,this.possibleSubjects[i])
          continue
        }
        //若全部是数字，不当做题目
        if(item.match(/^\d+$/)){
          log.info(`剔除全部是数字的`,this.possibleSubjects[i])
          continue
        }
        result.push(this.possibleSubjects[i])
      }
      this.possibleSubjects = result

    }

    //将题目分到不同的组
    groupByX(){
      var resultGroups = []
      var tmpGroup = []
      var length = this.possibleSubjects.length
      //把具有类似X偏移量的item放到一组
      for (var i = 0; i < length; i++) {
        var item = this.possibleSubjects[i]
        var isMatch = false
        for (var index in resultGroups) {
          if (resultGroups[index].match(item)) {
            isMatch = true
            resultGroups[index].addItem(item)
          }
        }
        //若未找到相似的组，则另起一组
        if(!isMatch){
          var offset = this.testPaper.getMaxX() * this.xOffsetRate
          var group = new ItemGroup(this.offset)
          group.addItem(item)
          resultGroups.push(group)
        }
      }

      log.debug('分组信息是',resultGroups)

      this.extractValidGroups(resultGroups)

    }

    //若一个分组的X坐标被另一个分组覆盖，则将两个组合并
    extractValidGroups(resultGroups){
      var validGroups = []
      for (var groupIndex in resultGroups) {
        var itemGroup = resultGroups[groupIndex]
        if (itemGroup.getItemAmount() < this.minItemAmount) continue
        for (var groupIndex2 in resultGroups) {
          if(groupIndex == groupIndex2) continue
          var itemGroup2 = resultGroups[groupIndex2]
          if (itemGroup.getItemAmount() < this.minItemAmount) continue
          if(itemGroup.contain(itemGroup2)){
            itemGroup.conbine(itemGroup2)
            validGroups.push(itemGroup)
          }
        }
      }
      this.pgae = validGroups.length
      this.sortAndDecorateHeads(validGroups)
    }

    sortAndDecorateHeads(validGroups){
      var sortedGroups = validGroups.sort((a,b) => {
        return a.getX() -  b.getX()
      })
      var sortNo = 1
      for (var i = 0; i < sortedGroups.length; i++) {
        var items = sortedGroups[i].getItems()
        for (var index in items) {
          var sortedItems = this.items.sort((a,b) => {
            return a.getY() -  b.getY()
          })
        }
        var page = i+1
        for (var index in sortedItems) {

          var item = sortedItems[index]
          item.setPage(page)
          item.setSortNo(sortNo)
          if(index == sortedItems.length - 1 && i == sortedGroups.length - 1){
            item.setType(config.FOOT)
          }else if(index == sortedItems.length - 1 && i != sortedGroups.length - 1){
            item.setType(config.FLIPOVER)
          }else{
            item.setType(config.BODY)
          }
          sortNo++
          this.subjectHeads.push(item)
        }
      }
      log.debug("题目排序完成",this.subjectHeads)
    }
}

module.exports = HeadAnalyser
