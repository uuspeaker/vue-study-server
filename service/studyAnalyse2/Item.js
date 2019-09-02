const log = require('../../util/log').getLogger("Item");
const path = require('path')
const uuid = require('uuid')
const fs = require('fs');



class Item{
    constructor(item){
      //每个item相同的X
      this.item = item
      this.sortNo
      this.page
      this.maxPage
      this.canUse = true
      this.rightX
      this.nextItem
    }

    getText(){return this.item.itemstring}
    getX(){return this.item.itemcoord.x}
    getY(){return this.item.itemcoord.y}
    getWidth(){return this.item.itemcoord.width}
    getHeight(){return this.item.itemcoord.height}
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

}

module.exports = Item
