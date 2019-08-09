var assert = require('assert');
var ItemAnalyser = require('../service/ItemAnalyser');
var testPaper = require('./data/math.test.json');

var itemAnalyser = new ItemAnalyser(testPaper)
itemAnalyser.analyse()

describe('检查试卷分析结果',function(){
    it('总共11题，识别出的题目不少于9题',function(){
        assert(itemAnalyser.validItems.length -9 >= 0);
    });

    it('抽查：2，7题的题目相同',function(){
        assert.equal('2.下列计算正确的是',itemAnalyser.validItems[1].DetectedText);
        assert.equal('7.已知a+b=m,ab= -4,化简(a +2)(b-2)的结果是',itemAnalyser.validItems[6].DetectedText);
        //assert.equal('20、 任何单位和个人不得阻挠和干涉对事故的报告、应急处置和依法调查处理。',itemAnalyser.validItems[19].DetectedText);
    });

});
