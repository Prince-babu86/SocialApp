const mongoose = require('mongoose');
const story = require('./story');

mongoose.connect('mongodb://127.0.0.1:27017/PART1');

// User Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  image:{
    type:String,
  },
  posts:[
    {type:mongoose.Schema.Types.ObjectId , ref:'post'}
  ],
  comments:[{type:mongoose.Schema.Types.ObjectId , ref:"post"}],
  story:[{
    type:mongoose.Schema.Types.ObjectId  , ref:"story"
  }],
  savedpost:[{type:mongoose.Schema.Types.ObjectId , ref:'post'}]
  

  
});


module.exports = mongoose.model('user' , userSchema);