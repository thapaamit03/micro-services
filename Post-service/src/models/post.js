const mongoose=require('mongoose');

const postSchema=mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Users',
        required:true
    },
    content:{
        type:String,
        required:true
    },
    mediaIds:[
        {
        type:String
    }
],
createdAt:{
    type:Date,
    default:Date.now()
}

},{timestamps:true})

postSchema.index({content:"text"})


const Post=mongoose.model('post',postSchema);

module.exports=Post;