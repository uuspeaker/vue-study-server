var assert = require('assert');
var fs = require('fs');
var ItemAnalyser = require('../../service/ItemAnalyser');
var chinese = require('../data/chinese.json');

var itemAnalyser = new ItemAnalyser(chinese)
itemAnalyser.analyse()

describe('检查试卷分析结果',function(){
    it('总共10题，识别出的题目应该不少于8题',function(){
        assert(itemAnalyser.validItems.length -8 >= 0);
    });

    // it('抽查：1，10题的题目相同',function(){
    //     assert.equal('1、生产经营单位的特种作业人员必须按照国家有关规定经专门的安全作业培训，取得特',itemAnalyser.validItems[0].DetectedText);
    //     assert.equal('10、 作业现场的生产条件、 安全设施、作业机具和安全工器具等应符合国家或行',itemAnalyser.validItems[9].DetectedText);
    // });

    it('检查图片切割',function(){
      fs.mkdir('./test/tmp/chinese',()=>{})
      assert(itemAnalyser.cutPaper('./test/image/chinese.png','./test/tmp/chinese'));
    });


});
