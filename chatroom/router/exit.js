var express = require('express');
var User = require('../models/User');

const app = new express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

var router = express.Router();


router.get('/', (req, res) => {
    User.update({
        username: req.cookies.user
    }, {
        state: false
    }).then(() => {
        res.clearCookie('user');
        res.clearCookie('flag');
        res.redirect('/login');
    });
});

module.exports = router;