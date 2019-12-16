const mongoose = require('mongoose');

const user = mongoose.Schema({
    username: String,
    password: String,
    image: String,
    state: Boolean
});

module.exports = user;