const log = require('../../util/log').getLogger("Item");
const path = require('path')
const uuid = require('uuid')
const fs = require('fs');



class Item{
    constructor(item){
      //每个item相同的X
      this.item = item
      this.subjectNo = ''
      this.sortNo = '未排序'
      this.page = '未分页'
      this.canUse = true
    }

    getText(){return this.item.itemstring}
    getX(){return this.item.itemcoord.x}
    getY(){return this.item.itemcoord.y}
    getWidth(){return this.item.itemcoord.width}
    getHeight(){return this.item.itemcoord.height}
    getSortNo(){return this.sortNo}
    getPage(){return this.page}

    setSortNo(sortNo){this.sortNo = sortNo}
    setPage(page){this.page = page}
    setType(type){this.type = type}
    joinGroup(){this.canUse = false}
    isValid(){return this.canUse}

}

module.exports = Item
