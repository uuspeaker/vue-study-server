const log = require('../../util/log').getLogger("ItemGroup");
const path = require('path')
const uuid = require('uuid')
const fs = require('fs');

class ItemGroup{
    constructor(offset){
      //每个item相同的X
      this.X = 0
      //原始数据
      this.items = [];
      //以数字开头的数据
      this.xOffset = offset
    }

    getX(){return this.X}
    getMaxWidth(){return this.maxWidth}
    getItemAmount(){return this.items.length}
    getItems(){return this.items}

    contain(targetItemGroup){
      if(targetItemGroup.getX() > this.X && targetItemGroup.getX() < this.X + this.getMaxWidth()){
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
    }

    //将可能的题目提取出来
    match(targetItem){
      if(this.items.length == 0) return true
      var offset = targetItem.getX() - this.getX()
      if(Math.abs(offset) < (this.xOffset)){
        return true
      }
      return false
    }

    addItem(targetItem){
      this.items.push[targetItem]
      if(this.items.length == 0){
        this.X = targetItem.getX()
        this.maxWidth = targetItem.getWidth()
      }else{
        this.items.push[targetItem]
        if(this.maxWidth < targetItem.getWidth()){
          this.maxWidth = targetItem.getWidth()
        }
      }
    }

}

module.exports = ItemGroup
