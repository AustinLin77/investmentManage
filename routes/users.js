var express = require('express');
var router = express.Router();
var handler = require('../handle/dbHandler.js');
var crypto = require('crypto');
var mongoose = require('mongoose');
var dateHandler = require('../handle/dateHandler');
var ipHandler = require('../handle/ipHandler');
/* POST users listing. */
//登录
router.post('/login', function(req, res, next) {
    let ip,address,isp,regionId,cityId;
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');
    ip=req.body.ip;

    console.log(ip)
    ipHandler(ip,function(err,cbres){
        console.log("333");
        if(typeof (cbres)=='undefined'){
            const error = new Error('missing cbs')
            error.httpStatusCode = 400
            return next(error)
        }
        // console.log(cbres.region_id);
        address=cbres.country+cbres.region+cbres.city;
        isp=cbres.isp;
        regionId=cbres.region_id;
        cityId=cbres.city_id;
        handler(req, res, "user", {userName: req.body.username},function(data){
            if(data.length===0){
                req.route.path='/addUser';
                if(req.route.path==='/addUser'){
                    req.route.path='/add'
                }
                var resignTime=dateHandler(new Date());
                console.log(cbres.region_id);
                //未注册的自动调注册接口然后存session进行登录
                handler(req, res, "user", {userName: req.body.username,passWord:password,resignTime:resignTime,address:address,isp:isp,regionId:regionId,cityId:cityId},function(data){
                    req.session.username = req.body.username; //存session
                    req.session.password = password;
                    console.log(cbres.city_id);
                    res.send('{"success":"true","statusText":"登录成功"}');
                })
            }else if(data[0].passWord !== password){
                res.send('{"err":"密码不正确"}');
            }else if(data.length!==0&&data[0].passWord===password){
                console.log(data)
                req.session.username = req.body.username; //存session
                req.session.password = password;
                console.log(req.session.username);
                res.send({success:"true",statusText:"登录成功",id:data[0]._id.toString(),uId:data[0].uId});
            }
        });
    })
});
//修改密码
router.post('/editPassword', function(req, res, next) {
    if (req.route.path === '/editPassword') {
        req.route.path = '/edit'
    }
    var id=req.body.id;
    var _id=mongoose.Types.ObjectId(id);
    handler(req, res, "user", {_id: _id}, function (data) {
        console.log(data);
        if (data.length === 0) {
            res.end('{"success":"false","statusText":"修改失败"}');
        }else{
              if (req.body.newPass) {
                  var md5 = crypto.createHash('md5');
                  req.body.newPass = md5.update(req.body.newPass).digest('base64');
              }
              if(req.body.originPass) {
                 var md5 = crypto.createHash('md5');
                 req.body.originPass = md5.update(req.body.originPass).digest('base64');
                 console.log(req.body.originPass);
                 console.log(data[0].passWord);
              if (data[0].passWord !== req.body.originPass) {
                  res.end('{"success":"false","statusText":"原密码错误"}');
              }else{
                  req.route.path = '/update';
                  var seletor = [{_id: _id}];
                  seletor.push({passWord:req.body.newPass});
                  handler(req, res, "user", seletor, function (data) {
                      if (data[0].ok === 1) {
                          res.end('{"success":"true","statusText":"修改成功"}');
                      }
                  })
              }
              }else{
                   req.route.path = '/update';
                   var seletor = [{_id: _id}];
                   delete req.body.id;
                   seletor.push(req.body);
                   handler(req, res, "user", seletor, function (data) {
                       if (data[0].ok === 1) {
                           res.end('{"success":"true","statusText":"修改成功"}');
                       }
                   })
                 }
              }
       })
});
//修改用户资料
router.post('/editUserInfo', function(req, res, next) {
    if (req.route.path === '/editUserInfo') {
        req.route.path = '/edit'
    }
    var id=req.body.id;
    var _id=mongoose.Types.ObjectId(id);
    handler(req, res, "user", {_id: _id}, function (data) {
        console.log(data);
        if (data.length === 0) {
            res.end('{"success":"false","statusText":"修改失败"}');
        }else{
            req.route.path = '/update';
            var seletor = [{_id: _id}];
            var param={
                nickName:req.body.nickName,
                year:req.body.year,
                email:req.body.email,
                telephone:req.body.telephone
            };
            seletor.push(param);
            handler(req, res, "user", seletor, function (data) {
                if (data[0].ok === 1) {
                    res.end('{"success":"true","statusText":"修改成功"}');
                }
            })
        }
    })
});
//获取个人信息
router.get('/findUserInfo', function(req, res, next) {
     req.route.path ='/show';
     var id=req.query.id;
     var _id=mongoose.Types.ObjectId(id);
     handler(req, res, "user", {_id:_id}, function (data) {
          if(data.length>0){
              res.send({success:"true",statusText:"获取成功",data:data})
          }else{
              res.send({success:"false",statusText:"获取失败,无该用户数据"})
          }
     })
});
//获取个人资金流水信息
router.get('/findUserFundDirection', function(req, res, next) {
    req.route.path ='/show';
    var id=req.query.id;
    var _id=mongoose.Types.ObjectId(id);
    handler(req, res, "user", {_id:_id}, function (data) {
        if(data.length>0){
            req.route.path ='/findUserList';
            var uId=data[0].uId;
            var selector=[];
            selector.push({uId:uId});
            selector.push(req.query.pageNum);
            selector.push(req.query.pageSize);
            handler(req, res, "fundDirection", selector, function (data) {
                if(data.success){
                    res.send({success:"true",statusText:"获取成功",data:data})
                }else{
                    res.send({success:"false",statusText:"获取失败,无该用户数据"})
                }
            })
        }else{
            res.send({success:"false",statusText:"获取失败,无该用户数据"})
        }
    })
});
//获取用户列表
router.get('/findUserList', function(req, res, next) {
    var selector=[];
    selector.push({});
    selector.push(req.query.pageNum);
    selector.push(req.query.pageSize);
    handler(req, res, "user", selector, function (data) {
        console.log(data.success);
        if(data.success){
            res.send({success:"true",statusText:"获取成功",data:data})
        }else{
            res.send({success:"false",statusText:"获取失败,无数据"})
        }
    })
});
//记录用户所选手机服务
router.post('/editUserPhoneService', function(req, res, next) {
    if (req.route.path === '/editUserPhoneService'){
        req.route.path = '/edit'
    }
    var id=req.body.id;
    var _id=mongoose.Types.ObjectId(id);
    handler(req, res, "user", {_id: _id}, function (data) {
        console.log(data);
        if (data.length === 0) {
            res.end('{"success":"false","statusText":"修改失败"}');
        }else{
            req.route.path = '/update';
            var seletor = [{_id: _id}];
            var param={
                userBasicService:req.body.basicService,
                userChooseService:req.body.chooseService,
            };
            seletor.push(param);
            handler(req, res, "user", seletor, function (data) {
                if (data[0].ok === 1) {
                    res.end('{"success":"true","statusText":"修改成功"}');
                }
            })
        }
    })
});
//新增资金流水信息
router.post('/insertFundDirection', function(req, res, next) {
    if (req.route.path === '/insertFundDirection') {
        req.route.path = '/add'
    }
    handler(req, res, "fundDirection", {
        createTime:req.body.createTime,
        type:req.body.type,
        description:req.body.description,
        income:req.body.income,
        pay:req.body.pay,
        cash_account:req.body.cash_account,
        uId:req.body.uId
    }, function (data) {
      console.log(data);
      if(data.result.ok==1){
          res.send({success:"true",statusText:"新增成功"})
      }
    })
});
//删除资金流水信息
router.post('/deleteFundDirection', function(req, res, next) {
    if (req.route.path === '/deleteFundDirection') {
        req.route.path = '/delete'
    }
    var id=req.body.id;
    console.log(id)
    var _id=mongoose.Types.ObjectId(id);
    var selector = {_id: _id};
    handler(req, res, "fundDirection", selector, function (data) {
        console.log(data);
        if(data[0].ok==1){
            res.end('{"success":"true","statusText":"删除成功"}')
        }
    })
});
//更新资金流水信息
router.post('/updateFundDirection', function(req, res, next) {
    if (req.route.path === '/updateFundDirection') {
        req.route.path = '/update'
    }
    var id=req.body.id;
    console.log(id)
    var _id=mongoose.Types.ObjectId(id);
    var selector = [{_id: _id}];
    var options = {
        createTime:req.body.createTime,
        type:req.body.type,
        description:req.body.description,
        income:req.body.income,
        pay:req.body.pay,
        cash_account:req.body.cash_account,
        uId:req.body.uId
    };
    selector.push(options);
    handler(req, res, "fundDirection", selector, function (data) {
        console.log(data);
        if(data[0].ok==1){
            res.end('{"success":"true","statusText":"更新成功"}')
        }
    })
});
//根据时间筛选个人资金流水信息(分页)
router.get('/findUserFundDirectionByTime', function(req, res, next) {
    req.route.path ='/show';
    var id=req.query.id;
    var startDate=req.query.startDate;
    var endDate=req.query.endDate;
    var _id=mongoose.Types.ObjectId(id);
    handler(req, res, "user", {_id:_id}, function (data) {
        if(data.length>0){
            var uId=data[0].uId;
            var selector=[];
            var condition={myCondition:[]};
            condition.myCondition.push(startDate);
            condition.myCondition.push(endDate);
            condition.myCondition.push(uId);
            selector.push(condition)
            selector.push(req.query.pageNum);
            selector.push(req.query.pageSize);
            req.route.path ='/findBy';
            handler(req, res, "fundDirection", selector, function (data) {
                if(data.success){
                    res.send({success:"true",statusText:"获取成功",data:data.data})
                }else{
                    res.send({success:"false",statusText:"获取失败,无该用户数据"})
                }
            })
        }else{
            res.send({success:"false",statusText:"获取失败,无该用户数据"})
        }
    })
});
//根据支付单号筛选个人支付单据信息(分页)
router.get('/findUserPayEvidenceByPaymentNum', function(req, res, next) {
    req.route.path ='/show';
    var id=req.query.id;
    var _id=mongoose.Types.ObjectId(id);
    handler(req, res, "user", {_id:_id}, function (data) {
        if(data.length>0){
            var uId=data[0].uId;
            var selector=[];
            var condition={myCondition:[]};
            condition.myCondition.push(req.query.paymentNum);
            condition.myCondition.push(uId);
            selector.push(condition)
            selector.push(req.query.pageNum);
            selector.push(req.query.pageSize);
            req.route.path ='/findByNum';
            handler(req, res, "payEvidence", selector, function (data) {
                if(data.success){
                    res.send({success:"true",statusText:"获取成功",data:data.data})
                }else{
                    res.send({success:"false",statusText:"获取失败,无该用户数据"})
                }
            })
        }else{
            res.send({success:"false",statusText:"获取失败,无该用户数据"})
        }
    })
});
//获取个人支付单据信息
router.get('/findUserPayEvidence', function(req, res, next) {
    req.route.path ='/show';
    var id=req.query.id;
    var _id=mongoose.Types.ObjectId(id);
    handler(req, res, "user", {_id:_id}, function (data) {
        if(data.length>0){
            req.route.path ='/findUserList';
            var uId=data[0].uId;
            var selector=[];
            selector.push({uId:uId});
            selector.push(req.query.pageNum);
            selector.push(req.query.pageSize);
            handler(req, res, "payEvidence", selector, function (data) {
                console.log(data);
                if(data.success){
                    res.send({success:"true",statusText:"获取成功",data:data})
                }else{
                    res.send({success:"false",statusText:"获取失败,无该用户数据" })
                }
            })
        }else{
            res.send({success:"false",statusText:"获取失败,无该用户数据"})
        }
    })
});
//删除支付单据信息
router.post('/deletePayEvidence', function(req, res, next) {
    if (req.route.path === '/deletePayEvidence') {
        req.route.path = '/delete'
    }
    var idGroup=req.body.idGroup;
    console.log(idGroup);
    for(var item in idGroup ){
        var _id=mongoose.Types.ObjectId(idGroup[item]);
        var selector = {_id: _id};
        handler(req, res, "payEvidence", selector, function (data) {
            console.log(data);
            if(data[0].ok==1){
                res.end('{"success":"true","statusText":"删除成功"}')
            }
        })
    }


});
//获取省份投资信息
router.get('/findProvinceInvestmentList', function(req, res, next) {
    req.route.path ='/show';
    handler(req, res, "chinaTouziList", {}, function (data) {
        if(data.length>0){
            res.send({success:"true",statusText:"获取成功",data:data})
        }else{
            res.send({success:"false",statusText:"获取失败,无该用户数据"})
        }
    })
});
//获取区域投资信息
router.get('/findAreaInvestmentList', function(req, res, next) {
    req.route.path ='/show';
    var selector={area: req.body.area}
    handler(req, res, "areaInvestment", selector, function (data) {
        if(data.length>0){
            res.send({success:"true",statusText:"获取成功",data:data})
        }else{
            res.send({success:"false",statusText:"获取失败,无该用户数据"})
        }
    })
});
module.exports = router;