const Search = require("../models/search");
const logger = require("../utils/logger");

async function handlePostCreated(event){

    try {
        const newSearchPost=new Search({
            postId:event.postId,
            userId:event.userId,
            content:event.content,
            createdAt:event.createdAt
        })
        await newSearchPost.save();
        logger.info(`Search post created : ${event.postId} ,${newSearchPost._id.toString()}`)
    } catch (error) {
        logger.error("error handling post creation event",error)
    }
}
async function  handledPostDeleted(event) {
    
    try {
        const postId=event.postId;
    
        const deletedPost=await Search.findByIdAndDelete(postId);
    
        logger.info('search post deleted successfully',deletedPost)
    
    } catch (error) {
        logger.error("errro occured while handling post deletion event",error)
    }
}
module.exports={handlePostCreated,handledPostDeleted};