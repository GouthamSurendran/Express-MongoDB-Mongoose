const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    admin:{
        type:Boolean,
        default:false
    }
});

User.plugin(passportLocalMongoose); //sets up passport authentication schema on User schema

module.exports = mongoose.model('User',User);