var assert = require('assert');
var TestPaper = require('../../../service/studyAnalyse2/TestPaper');

describe('math检查试卷分析结果',async () => {
  var paperData = require('../../data/tmp2.json');
  var testPaper = new TestPaper('./test/image/tmp.jpg',paperData.data.items)
  await testPaper.init()

  // var paperData = require('../../data/math.json');
  // var testPaper = new TestPaper('./test/image/math.png',paperData)
  // await testPaper.init()
  // it('总共11题，识别出的题目不少于9题',function(){
  //     assert(testPaper.getSubjectInfos().length >= 9);
  // });
})
