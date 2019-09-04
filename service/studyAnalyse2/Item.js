const log = require('../../util/log').getLogger("Item");
const path = require('path')
const uuid = require('uuid')
const fs = require('fs');



class Item{
    constructor(item){
      //内容
      this.itemstring = item.itemstring
      //坐标（X，Y，width，height）
      this.itemcoord = item.itemcoord
      //题目编号
      this.sortNo
      //题目所在页码
      this.page
      //所属试卷最大页码
      this.maxPage
      //是否可用（若已经分到某个组则不可用）
      this.canUse = true
      //右上角X坐标
      this.rightX
      //下一题
      this.nextItem
    }

    getText(){return this.itemstring}
    getX(){return this.itemcoord.x}
    getY(){return this.itemcoord.y}
    getWidth(){return this.itemcoord.width}
    getHeight(){return this.itemcoord.height}
    getSortNo(){return this.sortNo}
    getPage(){return this.page}
    getMaxPage(){return this.maxPage}
    getType(){return this.type}
    getRightX(){return this.rightX}
    getNext(){return this.nextItem}

    setSortNo(sortNo){this.sortNo = sortNo}
    setPage(page){this.page = page}
    setMaxPage(maxPage){this.maxPage = maxPage}
    setType(type){this.type = type}
    setRightX(rightX){this.rightX = rightX}
    setNext(nextItem){this.nextItem = nextItem}
    joinGroup(){this.canUse = false}
    isValid(){return this.canUse}

    //计算两个题目是否重合
    cover(targetItem){
      var leftCover = (this.getX() >= targetItem.getX()) &&  (this.getX() <= targetItem.getX() + targetItem.getWidth())
      var rightCover = (this.getX() + this.getWidth() >= targetItem.getX()) &&  (this.getX() + this.getWidth() <= targetItem.getX() + targetItem.getWidth())
      if(leftCover || rightCover){
        return true
      }else{
        return false
      }
    }

}

module.exports = Item
