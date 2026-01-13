const Notification = require("../models/Notification");
const logger = require("../utils/logger");

const getNotification=async(req,res)=>{

    const userId=req.user.userId;
    if(!userId){
        logger.warn("userId is required");
        return res.status(400).json({
            message:"please login to continue!!",
            success:false
        })
    }
    const notifications=await Notification.find({userId}).sort({createdAt:-1})  //sort in descending order from newest to oldest

    res.status(200).json({
        success:false,
        notifications
    })

}

module.exports=getNotification;