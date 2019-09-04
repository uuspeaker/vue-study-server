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
      //X坐标偏移量
      this.xOffset = offset
      //是否可用，若已经被归到某个组则不可用
      this.isGroupValid = true
      //最小覆盖率
      this.minCoverRate = 0.3
      //分组id
      this.groupId = uuid.v1()
    }

    getX(){return this.X}
    getWidth(){return this.width}
    getItems(){return this.items}
    getItemAmount(){return this.items.length}
    isValid(){return this.isGroupValid}
    destroy(){this.isGroupValid = false}

    //计算是否覆盖某个分组
    cover(targetItemGroup){
      var coverCount = 0
      for (var index1 in this.items) {
        for (var index2 in targetItemGroup.getItems()) {
          if(this.items[index1].cover(targetItemGroup.getItems()[index2])){
            coverCount++
          }
        }
      }
      var coverRate = coverCount / (this.getItemAmount() * targetItemGroup.getItems().length)
      log.info('覆盖率',coverRate)
      if(coverRate > this.minCoverRate){
        return true
      }else{
        return false
      }
    }

    //将两个分组合并
    combine(targetItemGroup){
      var targetItems = targetItemGroup.getItems()
      for (var index in targetItems) {
        this.addItem(targetItems[index])
      }
      targetItemGroup.destroy()
    }

    //计算X坐标是否重合，用于将X坐标靠近的题目分到一组
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
