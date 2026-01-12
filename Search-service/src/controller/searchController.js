const Search = require("../models/search");
const logger = require("../utils/logger")


 const invalidCache=async(req,input)=>{
    const cachedKey=`post:${input}`;
    await req.redisClient.del(cachedKey);

    const keys=await req.redisClient.keys("posts:*");  //extra all key start with posts
    if(keys.length > 0){
        await req.redisClient.del(keys)
    }
 }
const serachPost=async(req,res)=>{
    logger.info("search endpoint hit...");
    const page=parseInt(req.query.page) ||1;
    const limit=parseInt(req.query.limit) ||10;
    const startIndex=(page-1)*limit;
    const cachedKey=`post:${page}:${limit}`;
    const cachedPost=await req.redisClient.get(cachedKey);
    if(cachedPost){
        logger.info("cached post ")
       return res.status(200).json(JSON.parse(cachedPost))
    }

  
    try {
        const query=req.query();
    
        const searchPosts=await Search.find(
            {
            $text:{ $search : query},
            },
            {
                score:{$meta:"textScore"},
            }
    ).sort({score:{$meta:"textScore"},}).limit(10);
    
    const totalNoOfPosts=await Search.countDocuments();

    const results={
        searchPosts,
        currentPage:page,
        limit:limit,
        totalPosts:totalNoOfPosts
    }
    //cache expire after 5min
    await req.redisClient.setex(cachedKey,300,JSON.stringify(results))

    res.status(200).json(results)
    
    } catch (error) {
        logger.error("error while searching post",error)
        res.status(500).json({
            message:"error while searching post",
            success:false
        })
    }

}

module.exports=serachPost;