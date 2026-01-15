const logger = require("../utils/logger");

const validateUser=(req,res,next)=>{

const userId=req.headers["x-user-id"];

    if(!userId){
        logger.warn("userId is required");
        return res.status(400).json({
            success:false,
            message:"please login to continue!!"
        })
    }

    req.user={userId}
    next();
}

module.exports=validateUser;