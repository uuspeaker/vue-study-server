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
    }

    getText(){return this.item.itemstring}
    getX(){return this.item.itemcoord.X}
    getY(){return this.item.itemcoord.Y}
    getWidth(){return this.item.itemcoord.width}
    getHeight(){return this.item.itemcoord.height}
    getSubjectNo(){return this.subjectNo}
    getSortNo(){return this.sortNo}
    getPage(){return this.page}

    setSubjectNo(subjectNo){this.subjectNo = subjectNo}
    setSortNo(sortNo){this.sortNo = sortNo}
    setSortNo(page){this.page = page}

}

module.exports = Item
