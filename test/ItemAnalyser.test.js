var assert = require('assert');
var ItemAnalyser = require('../service/ItemAnalyser');
var testPaper = require('./data/testPaper.json');

var itemAnalyser = new ItemAnalyser(testPaper)
itemAnalyser.analyse()

describe('检查试卷分析结果',function(){
    it('总共20题，识别出的题目应该不少于18题',function(){
        assert(itemAnalyser.validItems.length -18 >= 0);
    });

    it('抽查：1，10题的题目相同',function(){
        assert.equal('1、生产经营单位的特种作业人员必须按照国家有关规定经专门的安全作业培训，取得特',itemAnalyser.validItems[0].DetectedText);
        assert.equal('10、 作业现场的生产条件、 安全设施、作业机具和安全工器具等应符合国家或行',itemAnalyser.validItems[9].DetectedText);
        //assert.equal('20、 任何单位和个人不得阻挠和干涉对事故的报告、应急处置和依法调查处理。',itemAnalyser.validItems[19].DetectedText);
    });

    it('坐标抽样检查，第1题的坐标应该是168，498，734，581',function(){
        assert.equal(168,itemAnalyser.itemPolygons[0].leftX);
        assert.equal(498,itemAnalyser.itemPolygons[0].leftY);
        assert(itemAnalyser.itemPolygons[0].rightX - 734 >0 );
        assert.equal(581,itemAnalyser.itemPolygons[0].rightY);
    });
    it('坐标抽样检查，第10题的坐标应该是827，134，1335，227',function(){
      assert.equal(827,itemAnalyser.itemPolygons[9].leftX);
      assert.equal(134,itemAnalyser.itemPolygons[9].leftY);
      assert(itemAnalyser.itemPolygons[9].rightX - 1335 > 0);
      assert.equal(227,itemAnalyser.itemPolygons[9].rightY);
    });
    // it('坐标抽样检查，第19题最后一题的坐标应该是828，879，1335，227',function(){
    //   assert.equal(828,itemAnalyser.itemPolygons[18].leftX);
    //   assert.equal(879,itemAnalyser.itemPolygons[18].leftY);
    //   assert(itemAnalyser.itemPolygons[18].rightX - 1335 > 0);
    //   assert.equal(227,itemAnalyser.itemPolygons[18].rightY);
    // });


});
