const log = require('../../util/log').getLogger("ItemGroup");
const path = require('path')
const uuid = require('uuid')
const fs = require('fs');

class ItemGroup{
    constructor(offset){
      //每个item相同的X
      this.X
      //原始数据
      this.items = [];
      //以数字开头的数据
      this.xOffset = offset
      this.width = '未初始化'
      this.isGroupValid = true
      //最大宽度比率，若某一行的宽度过大（则认定是ocr把不相干的行识别到了一起），剔除掉，以免导致分组合并时将不同的页合到一起
      this.validWidthRate = 1.5
      this.hasCalculate = false
      this.groupId = uuid.v1()
    }

    getX(){return this.X}
    getWidth(){return this.width}
    getItemAmount(){return this.items.length}
    getItems(){return this.items}
    isValid(){return this.isGroupValid}
    destroy(){this.isGroupValid = false}
    reset(){this.hasCalculate = false}

    cover(targetItemGroup){
      var leftCover = (this.getX() >= targetItemGroup.getX()) &&  (this.getX() <= targetItemGroup.getX() + targetItemGroup.getWidth())
      var rightCover = (this.getX() + this.getWidth() >= targetItemGroup.getX()) &&  (this.getX() + this.getWidth() <= targetItemGroup.getX() + targetItemGroup.getWidth())
      if(leftCover || rightCover){
        return true
      }else{
        return false
      }
    }

    combine(targetItemGroup){
      var targetItems = targetItemGroup.getItems()
      for (var index in targetItems) {
        this.addItem(targetItems[index])
      }
      targetItemGroup.destroy()
      this.calculate()
    }

    //将可能的题目提取出来
    match(targetItem){
      if(this.items.length == 0) return true
      var offset = targetItem.getX() - this.getX()
      if(Math.abs(offset) <= this.xOffset){
        return true
      }
      return false
    }

    addItem(targetItem){
      if(this.items.length == 0){
        this.X = targetItem.getX()
      }else{
        if(this.getX() > targetItem.getX()){
          this.X = targetItem.getX()
        }
      }
      this.items.push(targetItem)
      targetItem.joinGroup()
    }

    calculate(){
      this.reset()
      var validItems = this.getValidItems()
      //log.debug('=============',validItems)
      for (var index in validItems) {
        this.calculateWidth(validItems[index])
      }
    }

    getValidItems(){
      var wotalWidth = 0
      for (var index in this.items) {
        wotalWidth = wotalWidth + this.items[index].getWidth()
      }
      var avgWidth = wotalWidth / this.items.length
      var validWidth = avgWidth * this.validWidthRate
      var validItems = []
      for (var index in this.items) {
        if(this.items[index].getWidth() <= validWidth){
          validItems.push(this.items[index])
        }else{
          log.info('剔除过长数据',this.items[index].getWidth(),validWidth,this.items[index])
        }
      }
      return validItems
    }

    calculateWidth(targetItem){
      log.debug(this.groupId,'before',this.getX(),this.getX()+this.getWidth(),targetItem.getX(),targetItem.getX()+targetItem.getWidth())
      if(!this.hasCalculate){
        this.width = targetItem.getWidth()
        log.debug(this.groupId,'开始计算this.width',this.width)
        this.hasCalculate = true
      }else{
        var oldRight = this.getX() + this.getWidth()
        var rightX = this.getX() + this.getWidth()
        if(rightX < targetItem.getX() + targetItem.getWidth()){
          rightX = targetItem.getX() + targetItem.getWidth()
          this.width = rightX - this.getX()
        }
        log.debug('oldRight========newRight',oldRight,rightX)
      }
      log.debug(this.groupId,'after',this.getX(),this.getX()+this.getWidth())
    }

    getBottomY(){
      var maxY = 0
      for (var index in this.items) {
        if(maxY < this.items[index].getY()){
          maxY = this.items[index].getY()
        }
      }
      return maxY
    }

}

module.exports = ItemGroup
