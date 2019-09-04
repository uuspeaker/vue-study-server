const log = require('../../util/log').getLogger("Item");
const path = require('path')
const uuid = require('uuid')
const fs = require('fs');



class Item{
    constructor(item){
      //每个item相同的X
      this.itemstring = item.itemstring
      this.itemcoord = item.itemcoord
      this.sortNo
      this.page
      this.maxPage
      this.canUse = true
      this.rightX
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
