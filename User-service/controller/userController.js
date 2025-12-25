const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const logger = require("../utils/logger")
const validateRegistration = require("../utils/validation")


const userRegistration=async(req,res)=>{

    logger.info("Registration endpoint...")
    try {
        const {error}=validateRegistration(req.body);
        if(error){
            logger.warn('validation error',error.details[0].message)  
            return res.status(400).json({
                message:error.details[0].message,
                success:false
            })
        }
        const {email,userName,password}=req.body;
        const existingUser=await User.findOne({$or:[{email},{userName}]});
        if(existingUser){
            logger.warn("user already exist",error.details[0].message)

            return res.status(400).json({
                message:"user already exist",
                success:false
            })
        }
       const user= new  User({
            userName,password,email
        })
        await user.save()
        logger.warn("user created successfully",user._id);
        
        const{accessToken,refreshToken}=await generateToken(user);

        res.status(201).json({
            message:"user registered successfully",
            success:true,
            refreshToken,
            accessToken
        })

    } catch (error) {
        logger.error("Registration error",e)
        res.status(500).json({
            message:"internal server error",
            success:false
        })
    }
}

module.exports={userRegistration}
