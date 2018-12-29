var mongo=require("mongodb");
var MongoClient = mongo.MongoClient;
var assert = require('assert');
var url = require('url');

var host="localhost";
var port="27017";
var Urls = 'mongodb://localhost:27017/investManage';
// classweb  ===> 自动创建一个



//分页查询
var findByPagination = function findByPagination(db,collections, selector, fn) {
    console.log(selector);
    let skipnumber = (parseInt(selector[1]) - 1) * parseInt(selector[2]);
    let totalCount;
    let collection = db.collection(collections);
    collection.find(selector[0]).count((err, res) => {
        assert.equal(err, null);
        totalCount = res;
    });
    collection.find(selector[0]).skip(skipnumber).limit(parseInt(selector[2])).toArray(function (err, result) {
        console.log(result);
        try {
            assert.equal(err, null);
            fn({
                success: true,
                data: result,
                totalCount: totalCount
            });
        } catch (e) {
            console.log(e);
            fn({
                success: false,
                data: [],
                totalCount: totalCount
            });
        }
    });
    db.close();

};
//add一条数据
var add = function(db,collections,selector,fn){
    var collection = db.collection(collections);
    collection.insertMany([selector],function(err,result){
        try{
            assert.equal(err,null)
        }catch(e){
            console.log(e);
            result = [];
        }
        fn(result);
        db.close();
    });
};
//delete
var deletes = function(db,collections,selector,fn){
    var collection = db.collection(collections);
    collection.deleteOne(selector,function(err,result){
        try{
            assert.equal(err,null);
            assert.notStrictEqual(0,result.result.n);
        }catch(e){
            console.log(e);
            result.result = "";
        }
        fn( result.result ? [result.result] : []); //如果没报错且返回数据不是0，那么表示操作成功。
        db.close;
    });
};
//find
var find = function(db,collections,selector,fn){
    //collections="hashtable";
    var collection = db.collection(collections);
    collection.find(selector).toArray(function(err,result){
        //console.log(docs);
        try{
            assert.equal(err,null);
        }catch(e){
            console.log(e);
            result = [];
        }
        fn( result); //如果没报错且返回数据不是0，那么表示操作成功。
        db.close();
    });
};
//findByCondition
var findBy = function(db,collections,selector,fn){
    console.log(selector)
    let skipnumber = (parseInt(selector[1]) - 1) * parseInt(selector[2]);
    let totalCount;
    var collection = db.collection(collections);
    collection.find({"$and":[
        {"createTime":{"$gt":selector[0].myCondition[0]}},{"createTime":{"$lt":selector[0].myCondition[1]}},
        {"uId":selector[0].myCondition[2]}]}).count((err, res) => {
        assert.equal(err, null);
        totalCount = res;
    });
    collection.find({"$and":[
        {"createTime":{"$gt":selector[0].myCondition[0]}},{"createTime":{"$lt":selector[0].myCondition[1]}},
        {"uId":selector[0].myCondition[2]}]}).skip(skipnumber).limit(parseInt(selector[2])).toArray(function (err, result) {
            console.log(result)
        try {
            assert.equal(err, null);
            fn({
                success: true,
                data: result,
                totalCount: totalCount
            });
        } catch (e) {
            console.log(e);
            fn({
                success: false,
                data: [],
                totalCount: totalCount
            });
        }
    });
};
//findByNum
var findByNum = function(db,collections,selector,fn){
    console.log(selector)
    let skipnumber = (parseInt(selector[1]) - 1) * parseInt(selector[2]);
    let totalCount;
    var collection = db.collection(collections);
    collection.find({"$and":[
        {"paymentNumber":selector[0].myCondition[0]}, {"uId":selector[0].myCondition[1]}]}).count((err, res) => {
        assert.equal(err, null);
        totalCount = res;
    });
    collection.find({"$and":[
        {"paymentNumber":selector[0].myCondition[0]}, {"uId":selector[0].myCondition[1]}]}).skip(skipnumber).limit(parseInt(selector[2])).toArray(function (err, result) {
        console.log(result)
        try {
            assert.equal(err, null);
            fn({
                success: true,
                data: result,
                totalCount: totalCount
            });
        } catch (e) {
            console.log(e);
            fn({
                success: false,
                data: [],
                totalCount: totalCount
            });
        }
    });
};

//update
var updates = function(db,collections,selector,fn){
    var collection = db.collection(collections);

    collection.updateOne(selector[0],{$set:selector[1]}, {multi: true, upsert: true},function(err,result){
        try{
            assert.equal(err,null);
            assert.notStrictEqual(0,result.result.n);
        }catch(e){
            console.log(e);
            result.result = "";
        }
        fn( result.result ? [result.result] : []); //如果没报错且返回数据不是0，那么表示操作成功。
        db.close();
    });
};

var methodType = {
    // 项目所需
    login:find,
    //   type ---> 不放在服务器上面
    //  放入到服务器
    //  请求---> 根据传入进来的请求 数据库操作
    //  req.query    req.body
    show:find, //后台部分
    add:add,
    update:updates,
    delete:deletes,
    updatePwd:updates,
    //portal部分
    showCourse:find,
    register:add,
    edit:find,
    findBy:findBy,
    findByNum:findByNum,
    findUserList:findByPagination
};
//主逻辑    服务器  ， 请求    --》
// req.route.path ==》 防止前端的请求 直接操作你的数据库
module.exports = function(req,res,collections,selector,fn){
    MongoClient.connect(Urls, function(err, db) {
        assert.equal(null, err);
        // console.log("Connected correctly to server");
        // 根据 请求的地址来确定是什么操作  （为了安全，避免前端直接通过请求url操作数据库）
        methodType[req.route.path.substr(1)](db,collections,selector,fn);
        db.close();
    });
};