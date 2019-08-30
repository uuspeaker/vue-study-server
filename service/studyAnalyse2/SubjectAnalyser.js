const log = require('../../util/log').getLogger("SubjectAnalyser");
const config = require('../../config/db')
const path = require('path')
const uuid = require('uuid')
const fs = require('fs');
const ItemGroup = require('./ItemGroup')

class SubjectAnalyser{
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
      this.validGroups = []
    }

    execute(){
      this.extractByRegExp()
      this.removeInvalidItems()
      this.groupByX()
      this.removeMinorGroups()
      this.combineGroups()
      this.sortGroups()
      //this.buildSubject()
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
          result.push(this.allItems[i])
    		}
      }
      this.possibleSubjects = result
      log.info(`和正则表达式${this.regExp}匹配的题目共${result.length}条`)
    }

    removeInvalidItems(){
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
      log.info(`有效题目是`,this.possibleSubjects)

    }

    //将题目分到不同的组
    groupByX(){
      var offset = this.testPaper.getMaxX() * this.xOffsetRate
      var length = this.possibleSubjects.length
      //把具有类似X偏移量的item放到一组
      for (var i = 0; i < length; i++) {
        var item = this.possibleSubjects[i]
        if(!item.isValid())continue
        var isMatch = false
        for (var index in this.validGroups) {
          if (this.validGroups[index].match(item)) {
            isMatch = true
            this.validGroups[index].addItem(item)
            item.joinGroup()
          }
        }
        //若未找到相似的组，则另起一组
        if(!isMatch){
          var group = new ItemGroup(offset)
          group.addItem(item)
          item.joinGroup()
          this.validGroups.push(group)
          this.groupByX()
          return
        }
      }
    }

    removeMinorGroups(){
      log.debug(`groupByX后分组`,this.validGroups)
      var resultGroups = []
      for (var index in this.validGroups) {
        if (this.validGroups[index].getItemAmount() >= this.minItemAmount){
          resultGroups.push(this.validGroups[index])
        }else{
          log.debug(`剔除数量过少分组`,this.validGroups[index])
          continue
        }
      }
      this.validGroups = resultGroups
    }

    //若一个分组的X坐标被另一个分组覆盖，则将两个组合并
    combineGroups(){
      for (var index1 in this.validGroups) {
        if(!this.validGroups[index1].isValid())continue
        for (var index2 in this.validGroups) {
          if(index1 == index2) continue
          if(!this.validGroups[index2].isValid())continue
          if(this.validGroups[index1].cover(this.validGroups[index2])){
            this.validGroups[index1].combine(this.validGroups[index2])
          }
        }
      }
      var resultGroups = []
      for (var index in this.validGroups) {
        if (this.validGroups[index].isValid()) {
          resultGroups.push(this.validGroups[index])
        }
      }
      this.validGroups = resultGroups
      log.debug(`合并后剩余${this.validGroups.length}组`)
    }

    sortGroups(){
      //对分组排序
      var sortedGroups = this.validGroups.sort((a,b) => {
        return a.getX() -  b.getX()
      })
      var sortNo = 1
      for (var i = 0; i < sortedGroups.length; i++) {
        var items = sortedGroups[i].getItems()
        //对每个分组下的item排序
        var sortedItems = items.sort((a,b) => {
          var hasSimilarHeight = Math.abs(a.getY() - b.getY()) < this.testPaper.getLineHeight()
          if(hasSimilarHeight){
            return a.getX() -  b.getX()
          }else{
            return a.getY() -  b.getY()
          }

        })
        //给每个item添加页码和序号
        for (var index in sortedItems) {
          var item = sortedItems[index]
          item.setPage(i+1)
          item.setSortNo(sortNo)
          sortNo++
          if(index == sortedItems.length - 1 && i == this.validGroups.length - 1){
            item.setType(config.FOOT)
          }else if(index == sortedItems.length - 1 && i != this.validGroups.length - 1){
            item.setType(config.FLIPOVER)
          }else{
            item.setType(config.BODY)
          }
          this.subjectHeads.push(item)
        }
      }
      log.debug("题目排序完成",this.subjectHeads)
    }

    buildSubject(){
      var sortNo = 1
      for (var i = 0; i < this.validGroups.length; i++) {
        var sortedItems = this.validGroups[i].getItems()
        for (var index in sortedItems) {
          var item = sortedItems[index]
          item.setPage(i+1)
          item.setSortNo(sortNo)
          if(index == sortedItems.length - 1 && i == this.validGroups.length - 1){
            item.setType(config.FOOT)
          }else if(index == sortedItems.length - 1 && i != this.validGroups.length - 1){
            item.setType(config.FLIPOVER)
          }else{
            item.setType(config.BODY)
          }
          sortNo++
          this.subjectHeads.push(item)
        }
      }
      log.debug("题目整理完成",this.subjectHeads)
    }
}

module.exports = SubjectAnalyser
