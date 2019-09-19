var assert = require('assert');
var SubjectManage = require('../../../service/paper/SubjectManage');

describe('检查题目查询',async () => {
  var subjectManage = new SubjectManage()
  await subjectManage.getSubjectList(111)
})
