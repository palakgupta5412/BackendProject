const mongoose = require("mongoose");

const tweetSchema = new mongoose.Schema({
    content : {
        type : String,
        required : true
    },
    owner : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    }
}, {timestamps : true});

module.exports = mongoose.model('Tweet' , tweetSchema);