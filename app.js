var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session=require('express-session');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
// process.on('unhandledRejection', rej => console.warn('全局捕获Rejection', rej));
// process.on('uncaughtException', function (err) {
//     //打印出错误
//     console.log(err);
//     //打印出错误的调用栈方便调试
//     console.log(err.stack);
// });
//跨域配置
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:4200"); //为了跨域保持session，所以指定地址，不能用*
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Credentials', true);
    //禁止使用缓存数据
    res.header('Cache-Control', 'no-store');

    next();
});
app.use(session({
    secret:'text',               //设置 session 签名
    // name:'investUser',
    cookie:{
        path:'/',
        maxAge:24*60*1000*60}, // 储存的时间 24小时
        resave:false,             // 每次请求都重新设置session
        saveUninitialized:true
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('text'));
app.use(express.static(path.join(__dirname, 'public')));


// app.use(function(req,res,next){
//     if (!req.session.username) {
//         if(req.url=="login"){
//             console.log("ccc");//如果请求的地址是登录则通过，进行下一个请求
//         }
//         else
//         {
//            console.log("aaa")
//         }
//     } else if (req.session.username) {
//         console.log("bbb")
//     }
// });
// app.use('/', function (req, res) {
//     if (req.session.username) {//检查用户是否已经登录
//         console.log(req.session);//打印session的值
//         res.send('welecome <strong>' + req.session.username + '</strong>, 欢迎你再次登录');
//     } else {//否则展示index页面
//
//         res.redirect('/');
//     }
// });
// app.use('/', function(req, res, next) {
//     console.log(req.session.username)
//     if (req.session.username) {//检查用户是否已经登录
//         res.end('{"success":"用户已登录","statusCode":"0"}');
//     } else {//否则展示index页面
//         res.end('{"failed":"用户未登录","statusCode":"1"}');
//     }
// });
app.use('/users', usersRouter);
app.use('/',indexRouter)
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    res.send('内部错误');
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  // res.locals.message = err.message;
  // res.locals.error = req.app.get('env') === 'development' ? err : {};
  //
  // // render the error page
  // res.status(err.status );
  // res.render('error');
    res.status(500);
    res.send({ error: "myerror" });
});

module.exports = app;
