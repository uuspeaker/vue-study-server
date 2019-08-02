const router = require('koa-router')()
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://study:123456@129.211.21.250:27017/admin';


router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Hello Koa 3!'
  })
})

router.get('/string', async (ctx, next) => {
  await MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
    if (err) throw err;
    var dbo = db.db("admin");
    var myobj = { name: "菜鸟教程", url: "www.runoob" };
    dbo.collection("site").insertOne(myobj, function(err, res) {
        if (err) throw err;
        console.log("文档插入成功");
        db.close();
    });
});
  ctx.body = 'koa2 string'
})

router.get('/json', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 json'
  }
})

module.exports = router
