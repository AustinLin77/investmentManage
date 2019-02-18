const http = require('http');
module.exports=function (ip, cb) {
    const serverurl = 'http://ip.taobao.com/service/getIpInfo.php?ip='+ip;
    http.get(serverurl, function(res) {
        var code = res.statusCode;
        console.log("222")
        if (code == 200) {
            console.log("111")
            res.on('data', function(data) {
                try {
                    console.log(data)
                    cb(null, JSON.parse(data).data);
                } catch (err) {
                    cb(err);
                }
            });
        } else {
            cb({ code: code });
        }
    }).on('error', function(e) { cb(e); });
};