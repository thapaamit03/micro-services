const mongoose=require('mongoose');

const mediaSchema=mongoose.Schema({
    publicId:{
        type:String,
        required:true
    },
    mediaUrl:{
        type:String,
        required:true
    },
  originalName:{
    type:String,
    required:true
  },
  mimeType:{
    type:String,
    required:true
  },
userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    }
},{timestamps:true})


const Media=mongoose.model('media',mediaSchema);

module.exports=Media;