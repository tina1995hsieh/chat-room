var express = require('express');
var app = express();
var swig = require('swig-templates');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');

var server = require('http').createServer(app);
app.use('/public', express.static(__dirname + '/public'));

const io = require('socket.io').listen(server);
const User = require('./models/User');


// set template
app.engine('html', swig.renderFile);
app.set('views', './views');
app.set('view engine', 'html');
swig.setDefaults({
    cache: false
});

// set body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded( {extended: false} ));

// set cookie
app.use(cookieParser());

// load router
app.use('/', require('./router/index'));
app.use('/login', require('./router/login'));
app.use('/register', require('./router/register'));
app.use('/exit', require('./router/exit'));

mongoose.connect('mongodb://localhost:27017/chatroom', (err, data) => {
    if (err) {
        console.log('Connecting database failed!');
    } else {
        server.listen(3000, () => {
            console.log('Server is listen on * 3000');
        });
    }
});

var usocket = {};
var user_lll = [];

io.on('connection', (socket) => {
    socket.on('login', (data) => {
        var username = data.username;
        socket.username = username;
        User.find().then((data) => {
            for (var i = 0; i < data.length; i++) {
                if (!data[i].state) {
                    data.splice(i, 1);
                }
            }
            socket.emit('loginSuccess', data);
            socket.broadcast.emit('user_list', data);
            socket.broadcast.emit('userIn', username);
        });
    });

    socket.on('send private message', (data) => {
        console.log(data);
        if (data.recepient in usocket) {
            usocket[data.recepient].emit('receive private message', data);
        }
    })

    socket.on('disconnect', (data) => {
        var username = data.username || socket.username;
        User.findOne({
            username: username
        }).then((userInfo) => {
            if (userInfo) {
                return User.update(
                    {_id: userInfo._id},
                    {state: false}
                )
            }
        }).then(() => {
            return User.find();
        }).then((data) => {
            for (var i = 0; i < data.length; i++) {
                if (!data[i].state) {
                    data[i].splice(i, 1);
                }
            }
            socket.broadcast.emit('user_list', data);
            socket.broadcast.emit('userOut', username);
        })
    });

    // receive new message
    socket.on('postNewMsg', (data) => {
        socket.broadcast.emit('newMsg', data);
    });

    // receive new image
    socket.on('postImg', (data) => {
        socket.broadcast.emit('newImg', data);
    });

    socket.on('postNewEmoji', (data) => {
        socket.broadcast.emit('newEmoji', data);
    });

    // update user information
    socket.on('edit', (data) => {
        var username = data.username || socket.username;
        User.findOne({
            username: username
        }).then(function (userInfo) {
            return User.update(
                {_id: userInfo._id}, 
                {username: data.newName, image: data.newImage}
            )
        }).then(() => {
            socket.username = data.newName;
            return User.find();
        }).then((data) => {
            for (var i = 0; i < data.length; i++) {
                if (!data[i].state) {
                    data.splice(i, 1);
                }
            }
            socket.emit('user_list', data);
            socket.broadcast.emit('user_list', data);
        });
    });
});




