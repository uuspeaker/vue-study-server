var assert = require('assert');
var fs = require('fs');
var ItemAnalyser = require('../../service/ItemAnalyser');
var english = require('../data/english.json');

var itemAnalyser = new ItemAnalyser(english)
itemAnalyser.analyse()

describe('检查试卷分析结果',function(){
    it('总共11题，识别出的题目应该不少于19题',function(){
        assert(itemAnalyser.validItems.length -9 >= 0);
    });

    it('检查图片切割',function(){
      fs.mkdir('./test/tmp/testPaper',()=>{})
      assert(itemAnalyser.cutPaper('./test/image/english.png','./test/tmp/english'));
    });

});
