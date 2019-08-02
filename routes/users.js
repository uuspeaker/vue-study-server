const router = require('koa-router')()
const mongoose = require('mongoose')
// 连接数据库：[ip/域名]:[端口号(默认27017)]/[数据库(db)]
mongoose.connect('mongodb://study:123456@129.211.21.250:27017/test',{"useNewUrlParser":true})
// 定义模型
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
});

router.prefix('/users')

router.get('/', function (ctx, next) {
  ctx.body = 'this is a users response!'
})

router.post('/', async (ctx, next) => {
  var userSchema = new mongoose.Schema({
  name: String,
})
userSchema.methods.speak = function () {
  var greeting = this.name
    ? "Meow name is " + this.name
    : "I don't have a name";
  console.log(greeting);
}
  const Cat = mongoose.model('Cat', userSchema)
  // 实例化一个实体对象
    const kitty = new Cat({ name: 'cat1' })
    console.log(kitty.name);
    kitty.speak()
    // 执行插入操作
    const res = await kitty.save()
    // 打印返回结果
    console.log(res)
  ctx.body = 'this is a users/bar response'
})

module.exports = router
