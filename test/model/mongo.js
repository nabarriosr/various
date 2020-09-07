'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var userSchemaJSON = {
    username: String,
    email: String,
    genre: String,
    passwordHash: String,
    img: { data: Buffer, contentType: String }
}
mongoose.connect('mongodb://localhost/net540', { useNewUrlParser: true, useUnifiedTopology: true });
var userSchema = new Schema(userSchemaJSON);
var User = mongoose.model("test1", userSchema);

module.exports = User;