const http = require('http');
module.exports=function getIpInfo(ip, cb) {
    const serverurl = 'http://ip.taobao.com/service/getIpInfo.php?ip=' + ip;
    http.get(serverurl, function(res) {
        var code = res.statusCode;
        if (code == 200) {
            res.on('data', function(data) {
                try {
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