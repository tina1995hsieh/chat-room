var express = require('express');
var User = require('../models/User');

var router = express.Router();

router.get('/', function (req, res) {
    res.render('login.html');
});

router.post('/signIn', function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    var resData = {};
    User.findOne({
        username: username,
        password: password
    }).then(function (userInfo) {
        if (!userInfo) {
            resData.success = 0;
            resData.err = "Username or password not match!";
            res.json(resData);
            return false;
        } else {
            if(userInfo.state){
                resData.success = 0;
                resData.err = "The username has logged in!";
                res.json(resData);
                return false;
            }else{
                User.update({
                    _id: userInfo._id
                }, {
                    state: true
                }).then(function () {
                    resData.success = 1;
                    resData.err = "Login success!";
                    res.cookie("user", userInfo.username, {maxAge: 1000 * 60 * 60});
                    res.json(resData);
                    next();
                })
            }
        }
    })
});

module.exports = router;