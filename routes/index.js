var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    if (req.session.username) {//检查用户是否已经登录
        res.end('{"success":"用户已登录","statusCode":"0"}');
    } else {//否则展示index页面
        res.end('{"failed":"用户未登录","statusCode":"1"}');
    }
});

module.exports = router;
