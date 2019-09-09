var assert = require('assert');
var SubjectLoader = require('../../../service/subjectPool/SubjectLoader');

describe('测试导入题目数据',async () => {
  var loader = new SubjectLoader()
  loader.load()
})

// describe('测试删除题目数据',async () => {
//   subjectLoader.deleteAll()
// })
