const mongoose = require('mongoose')


const storySchema = mongoose.Schema({
    storyImage:String,
    storyTitle:String,
    storyTags:String,
    user:{
        type:mongoose.Schema.Types.ObjectId , ref:'user'
    },
})

module.exports  =  mongoose.model('story' , storySchema);