var assert = require('assert');
var TestPaper = require('../../../service/studyAnalyse/TestPaper');

describe('math检查试卷分析结果',function(){
  var paperData = require('../../data/math.json');
  var testPaper = new TestPaper('./test/image/math.png',paperData)
  it('总共11题，识别出的题目不少于9题',function(){
      assert(testPaper.getSubjectCount() >= 9);
  });

  it('抽查：2，7题的题目相同',function(){
      assert.equal('2.下列计算正确的是',testPaper.getSubject(2).getTitle());
      assert.equal('7.已知a+b=m,ab= -4,化简(a +2)(b-2)的结果是',testPaper.getSubject(7).getTitle());
  });

  it('检查math图片切割',function(){
    assert(testPaper.getSubjectInfos().length > 9);
  });
});

// describe('chinese检查试卷分析结果',function(){
//   var paperData = require('../../data/chinese.json');
//   var testPaper = new TestPaper('./test/image/chinese.png',paperData)
//   it('总共11题，识别出的题目不少于9题',function(){
//       assert(testPaper.getSubjectCount() >= 9);
//   });
//
//   it('检查chinese图片切割',function(){
//     assert(testPaper.drawSubjects('./test/tmp/chinese'));
//   });
//   it('检查chinese内容提取',function(){
//     assert(testPaper.printSubjects());
//   });
// });
//
// describe('english检查试卷分析结果',function(){
//   var paperData = require('../../data/english.json');
//   var testPaper = new TestPaper('./test/image/english.png',paperData)
//   it('总共11题，识别出的题目不少于9题',function(){
//       assert(testPaper.getSubjectCount() >= 9);
//   });
//
//   it('检查english图片切割',function(){
//     assert(testPaper.drawSubjects('./test/tmp/english'));
//   });
//   it('检查english内容提取',function(){
//     assert(testPaper.printSubjects());
//   });
// });
//
// describe('other检查试卷分析结果',function(){
//   var paperData = require('../../data/other.json');
//   var testPaper = new TestPaper('./test/image/other.jpg',paperData)
//   it('总共20题，识别出的题目应该不少于18题',function(){
//       assert(testPaper.getSubjectCount() >= 18);
//   });
//
//   it('抽查：1，10题的题目相同',function(){
//       assert.equal('1、生产经营单位的特种作业人员必须按照国家有关规定经专门的安全作业培训，取得特',testPaper.getSubject(1).getTitle());
//       assert.equal('10、 作业现场的生产条件、 安全设施、作业机具和安全工器具等应符合国家或行',testPaper.getSubject(10).getTitle());
//   });
//
//   it('检查图片切割',function(){
//     assert(testPaper.printSubjects('./test/tmp/other'));
//   });
//
// });
