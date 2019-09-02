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
      this.width
      this.isGroupValid = true
      this.validWdithRate = 1.5
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
      var leftCover = this.getX() >= targetItemGroup.getX() &&  this.getX() <= targetItemGroup.getX() + targetItemGroup.getWidth()
      var rightCover = this.getX() + this.getWidth() >= targetItemGroup.getX() &&  this.getX() + this.getWidth() <= targetItemGroup.getX() + targetItemGroup.getWidth()
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
      var validWidth = avgWidth * this.validWdithRate
      var validItems = []
      for (var index in this.items) {
        if(this.items[index].getWidth() <= validWidth){
          validItems.push(this.items[index])
        }
      }
      return validItems
    }

    calculateWidth(targetItem){
      log.debug(this.groupId,'before',this.getX(),this.getX()+this.getWidth(),targetItem.getX(),targetItem.getX()+targetItem.getWidth())
      if(this.hasCalculate){
        log.debug(this.groupId,'开始计算区域')
        this.width = targetItem.getWidth()
      }else{
        var rightX = this.getX() + this.getWidth()
        if(rightX < targetItem.getX() + targetItem.getWidth()){
          rightX = targetItem.getX() + targetItem.getWidth()
          this.width = rightX - this.getX()
        }
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
