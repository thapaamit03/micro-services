 const Post = require('../models/post');
const logger=require('../utils/logger');
const validateSchema = require('../utils/validate');
 const createPost=async(req,res)=>{
    logger.info("post service endpoint...")
    try {
    const {error}=validateSchema(req.body);

    if(error){
        logger.warn("content filed is required",error)
        return res.status(400).json({
            success:false,
            message:error[0]
        })
    }
    
        const{content,mediaUrls}=req.body;
        if (!req.user || !req.user.userId) {
    return res.status(401).json({
        success: false,
        message: "Unauthorized: user info missing"
    });
}
        const newlyCreatedPost=new Post({
            user:req.user.userId,
            content,
            mediaUrls:mediaUrls || []
        })
        await newlyCreatedPost.save();
        logger.info("post created successfullt")
        return res.status(200).json({
            success:true,
            message:"post created successfullt",
            post:{id:newlyCreatedPost._id, content:newlyCreatedPost.content}
        })
    } catch (error) {
        logger.error("Internal server error",error)
        return res.status(500).json({
            message:error.message||"error while creating post",
            success:false
        })
    }
 }

 const getAllPosts=async(req,res)=>{

   try {
     const page=parseInt(req.query.page) ||1;
     const limit=parseInt(req.query.limit) ||10;
     const startIndex=(page-1)*limit;  //pagination 0-9 index and 10-19
     const cacheKey=`posts:${page}:${limit}`;
     const cachedPosts=await req.redisClient.get(cacheKey);
 
     if(cachedPosts){
         return res.json(JSON.parse(cachedPosts))
     }
 
     const posts=await Post.find({})
     .sort({createdAt:-1})
     .skip(startIndex)
     .limit(limit);
 
     const totalNoOfPosts=await Post.countDocuments();
 
     const results={
         posts,
         currentPage:page,
         totalPosts:totalNoOfPosts
     }
     await req.redisClient.setex(cacheKey,300,JSON.stringify(results))
 
     res.status(200).json(results)
   } catch (error) {
    logger.warn("Error fetching posts",error)
    res.status(500).json({
        message:"Error fetching posts",
        success:false
    })
   }
 }

 module.exports={createPost,getAllPosts}