const express = require('express');
const User = require('../models/User');

const router = express.Router();

router.get('/', (req, res) => {
    res.render('register.html');
});

router.post('/signup', (req, res) => {
    var username = req.body.username;
    var password = req.body.password;
    var resData = {};

    User.findOne({
        username: username
    }).then((userInfo) => {
        if (userInfo) {
            resData.success = 0;
            resData.err = "Username have been used!";
            res.json(resData);
            return false;
        } else {
            var user = new User({
                username: username,
                password: password,
                image: '../public/img/img.png',
                state: false
            });
            return user.save();
        }
    }).then(() => {
        resData.success = 1;
        resData.message = "Register succeed!";
        res.json(resData);
    })
});

module.exports = router;