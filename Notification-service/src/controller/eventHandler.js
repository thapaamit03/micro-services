const Notification = require("../models/Notification")
const logger = require("../utils/logger")


const handlePostCreated=async(event)=>{

    if(!event){
       return logger.warn("error during event processing")
    }

    logger.info(`Post created:${event.postId} by ${event.userId}`)
    await Notification.create({
        userId:event.userId,
        title:"New Post created",
        type:"POST_CREATED",
        metaData:{
            postId:event.postId
        }
})
}

const handlePostDeleted=async(event)=>{

    if(!event){
        return logger.warn("error during event processing")
    }

    logger.info(`post deleted:${event.postId} by ${userId}`)

    await Notification.create({
        userId:event.userId,
        title:"post deleted",
        message:"you have deleted a post",
        type:"POST_DELETED",
        metaData:{
            postId:event.postId
        }
    })
}

module.exports={handlePostCreated,handlePostDeleted}