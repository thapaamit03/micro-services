const mongoose=require("mongoose");


const NotificationSchema=mongoose.Schema({

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    title:{
        type:String
    },
    message:{
        type:String
    },
    type:{
        type:String,
        enum:[
            'POST_CREATED',
            'POST_DELETED',
            'USER_REGISTERED'
        ]
    },
   metaData:{
        type:Object
    },
    createdAt:{
        type:Date
    }
},{timestamps:true})


NotificationSchema.index({createdAt:-1});


const Notification=mongoose.model('notification',NotificationSchema);


module.exports=Notification;