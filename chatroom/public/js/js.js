document.cookie = 'flag=true';
var username = $('#username').text();
var socket = io.connect('http://localhost:3000');
socket.emit('login', {username: username});
socket.on('loginSuccess', function (data) {
    userUpdate(data);
});

// update online number
socket.on('user_list', function (data) {
    userUpdate(data);
});

// user enter the chatroom
socket.on('userIn', function (data) {
    var html = '<li class="tip"><div class="text-center">@ ' + data + ' @join the chatroom</div></li>';
    $('#MsgList').append(html);
});

// user leave the chatroom
socket.on('userOut', function (data) {
    var html = '<li class="tip"><div class="text-center">@ ' + data + ' @left the chatroom</div></li>';
    $('#MsgList').append(html);
});

// exit
$('#exitBtn').on('click', function () {
    var username = $('#username').text();
    location.href = 'exit';
});

// send message
$('#sendBtn').on('click', function () {
    var msg = $('#msgInput').val();
    if (msg == '') {
        alert('Cannot send empty message！');
        return false;
    }
    var username = $('#username').text();
    var img = $('#userImage').attr('src');
    meSendMsg(msg, 0);
    socket.emit('postNewMsg', {msg: msg, username: username, image: img});
    $('#msgInput').val('');
});

$(document).keydown(function (e) {
    var e = e || window.event;
    if (e.keyCode == 13 && e.ctrlKey) {
        e.preventDefault();
        $('#msgInput').val($('#msgInput').val() + '\n');
    } else if (e.keyCode == 13) {
        e.preventDefault();
        $('#sendBtn').click();
    }
});

// accept message
socket.on('newMsg', function (data) {
    getMsg(data, 0);
});

// send image
$('#addImage').on('click', function (e) {
    var e = e || window.event;
    e.stopPropagation();
    $('#files').trigger('click');
});

// accept image
socket.on('newImg', function (data) {
    getMsg(data, 1);
});

// update information
$('#editImage').on('click', function (e) {
    var e = e || window.event;
    e.stopPropagation();
    $('#fileImg').trigger('click');
});

$('#editBtn').on('click', function () {
    var newName = $('#newName').val();
    var newImage = $('#editImage').attr('src');
    $('#userImage').attr('src', newImage);
    $('#username').html(newName);
    $('#changeInfo').modal('hide');
    socket.emit('edit', {newName: newName, newImage: newImage, username: username});
});

// send emoji
$('#smileBtn').on('click', function () {
    alert('button clicked');
    var emojiwrapper = document.getElementById('emojiWrapper');
    emojiwrapper.style.display = 'block';
    e.stopPropagation();
});

function editImageFn(e) {
    var e = e || window.event;
    var files = e.target.files || e.dataTransfer.files;
    var fs = new FileReader();
    fs.readAsDataURL(files[0]);
    fs.onload = function () {
        $('#editImage').attr('src', this.result);
    }
}

function changeFiles(e) {
    var e = e || window.event;
    var files = e.target.files || e.dataTransfer.files;
    var len = files.length;
    if (len === 0) return false;
    for (var i = 0; i < len; i++) {
        var fs = new FileReader();
        fs.readAsDataURL(files[i]);
        fs.onload = function () {
            var username = $('#username').text();
            var img = $('#userImage').attr('src');
            socket.emit('postImg', {imgData: this.result, username: username, image: img});
            meSendMsg(this.result, 1);
        }
    }
}

function userUpdate(data) {
    var len = data.length;
    var str = '';
    for (var i = 0; i < len; i++) {
        str += '<li>';
        str += '<img src="' + data[i].image + '" class="userImg">';
        str += '<span>' + data[i].username + '</span>'
    }
    $('#peopleList').html(str);
    $('#list-count span').html(len);
}


function meSendMsg(msg, n) {
    var src = $('#userImage').attr('src');
    var name = $('#username').text();
    var html = ' <li class="me">';
    html += '<div class="row">';
    html += ' <div class="userInfo col-sm-1 col-md-1 pull-right">';
    html += '<img src="' + src + '" style="width: 100%;margin-bottom: 5px">';
    html += '<p class="text-center">' + name + '</p>';
    html += '</div>';
    html += '<div class="msgInfo col-sm-5 col-md-5 pull-right">';
    if (n == 0) {
        html += msg;
    } else if (n == 1) {
        html += '<img src="' + msg + '" alt="" style="max-width:100%; ">';
    }

    html += '</div></div></li>';
    $('#MsgList').append(html);
    var Li = $('#MsgList li');
    var len = Li.length;
    var LiH = Li.eq(len - 1).height();
    var h = document.getElementById('MsgList').scrollHeight;
    document.getElementById('MsgList').scrollTop = h + LiH;
}

function getMsg(data, n) {
    var html = ' <li >';
    html += '<div class="row">';
    html += ' <div class="userInfo col-sm-1 col-md-1">';
    html += '<img src="' + data.image + '" style="width: 100%;margin-bottom: 5px">';
    html += '<p class="text-center">' + data.username + '</p>';
    html += '</div>';
    html += '<div class="msgInfo col-sm-5 col-md-5 ">';
    if (n == 0) {
        html += data.msg;
    } else if (n == 1) {
        html += '<img src="' + data.imgData + '" alt="" style="max-width:100%; ">';
    }
    html += '</div></div></li>';
    $('#MsgList').append(html);
    var Li = $('#MsgList li');
    var len = Li.length;
    var LiH = Li.eq(len - 1).height();
    var h = document.getElementById('MsgList').scrollHeight;
    document.getElementById('MsgList').scrollTop = h + LiH;
}