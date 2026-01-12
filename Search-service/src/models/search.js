const mongoose=require('mongoose');

const searchSchema=mongoose.Schema({

    postId:{
        type:String,
        required:true,
        unique:true
    },
    userId:{
        type:String,
        required:true,
        index:true
    },
    content:{
        type:String,
        required:true
    },
    createdAt:{
        type:String,
        required:true
    }
},{timestamps:true})

searchSchema.index({content:"text"})
searchSchema.index({createdAt:-1})

const Search=mongoose.model('search',searchSchema);

module.exports=Search