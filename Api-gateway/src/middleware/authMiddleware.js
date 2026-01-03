const logger = require("../utils/logger");
const jwt=require('jsonwebtoken')


const validateToken=(req,res,next) => {

   try {
     const authHeader=req.headers["authorization"];
     const token=authHeader&&authHeader.split(" ")[1];
     if(!token){
         logger.warn("Invalid credentials,Authorization token is required")
         return res.status(401).json({
             success:false,
             message:"Authentication required"
         })
     }
 
     const decoded=jwt.verify(token,process.env.JWT_SECRET)
        logger.info(decoded)
        
         req.user={userId:decoded.id};
         next();
   } catch (error) {
        logger.error("Internal server error",error.message)
        res.status(500).json({
            success:false,
            message:"Internal server error"
        })
   }


}

module.exports=validateToken