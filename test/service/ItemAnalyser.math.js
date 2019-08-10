var assert = require('assert');
var ItemAnalyser = require('../../service/ItemAnalyser');
var math = require('../data/math.json');
var fs = require('fs');

//path.join(dirname,'../')

var itemAnalyser = new ItemAnalyser(math)
itemAnalyser.analyse()

describe('检查试卷分析结果',function(){
    it('总共11题，识别出的题目不少于9题',function(){
        assert(itemAnalyser.validItems.length -9 >= 0);
    });

    it('抽查：2，7题的题目相同',function(){
        assert.equal('2.下列计算正确的是',itemAnalyser.validItems[1].DetectedText);
        assert.equal('7.已知a+b=m,ab= -4,化简(a +2)(b-2)的结果是',itemAnalyser.validItems[6].DetectedText);
    });
    it('检查图片切割',function(){
      //var imageUrl = path.join(dirname,'./test/image/testPaper.jpg')
      //log.debug('imageUrl',imageUrl)
      fs.mkdir('./test/tmp/mathPaper',()=>{})
      assert(itemAnalyser.cutPaper('./test/image/math.png','./test/tmp/math'));
    });

});
