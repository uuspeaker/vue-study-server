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
      //最小覆盖率
      this.minCoverRate = 0.3
      this.groupId = uuid.v1()
    }

    getX(){return this.X}
    getWidth(){return this.width}
    getItems(){return this.items}
    getItemAmount(){return this.items.length}
    isValid(){return this.isGroupValid}
    destroy(){this.isGroupValid = false}
    reset(){this.hasCalculate = false}

    cover(targetItemGroup){
      var coverCount = 0
      for (var index1 in this.items) {
        for (var index2 in targetItemGroup) {
          if(this.items[index1].cover(targetItemGroup[index2])){
            coverCount++
          }
        }
      }
      var coverRate = coverCount / (this.getItemAmount() * targetItemGroup.getItems().length)
      if(coverRate > this.minCoverRate){
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
