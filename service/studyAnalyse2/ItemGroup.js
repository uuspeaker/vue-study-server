const log = require('../../util/log').getLogger("ItemGroup");
const path = require('path')
const uuid = require('uuid')
const fs = require('fs');

class ItemGroup{
    constructor(offset){
      //每个item相同的X
      this.X = '未初始化'
      //原始数据
      this.items = [];
      //以数字开头的数据
      this.xOffset = offset
      this.width = '未初始化'
      this.isGroupValid = true
    }

    getX(){return this.X}
    getWidth(){return this.width}
    getItemAmount(){return this.items.length}
    getItems(){return this.items}
    isValid(){return this.isGroupValid}
    destroy(){this.isGroupValid = false}

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
        this.width = targetItem.getWidth()
      }else{
        var leftX = this.getX()
        var rightX = this.getX() + this.getWidth()
        if(leftX > targetItem.getX()){
          this.X = targetItem.getX()
        }
        if(rightX < targetItem.getX() + targetItem.getWidth()){
          rightX = targetItem.getX() + targetItem.getWidth()
          this.width = rightX - leftX
        }
      }
      this.items.push(targetItem)
    }

}

module.exports = ItemGroup
