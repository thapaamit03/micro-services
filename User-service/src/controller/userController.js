
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const logger = require("../utils/logger")
const {validateRegistration,validateLogin} = require("../utils/validation")
const jwt=require('jsonwebtoken')

const userRegistration=async(req,res)=>{

    logger.info("Registration endpoint...")
    try {
        const {error}=validateRegistration(req.body);
        if(error){
            logger.warn('validation error',error.details[0].message)  
            return res.status(400).json({
                message:"all fields are required",
                success:false
            })
        }
        const {email,userName,password}=req.body;
        const existingUser=await User.findOne({$or:[{email},{userName}]});
        if(existingUser){
            logger.warn("user already exist",{email,userName})

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
        logger.error("Registration error",error)
        res.status(500).json({
            message:"internal server error",
            success:false
        })
    }
}
const userLogin=async(req,res)=>{
    logger.info("Login endpoint...")
    try {
       const {error}=validateLogin(req.body);
    
       if(error){
        logger.warn("validation error",error.details[0].message)
        return res.status(400).json({
            success:false,
            message:"validation error"
        })
       }
       const{email,password}=req.body;
        const user=await User.findOne({email});
    
        if(!user){
            logger.warn("Invalid user")
            return res.status(404).json({
                message:"Invalid credentials",
                success:false   
            })
        }
    
        const isVlaidPassword= await user.comparePassword(password); 
        if(!isVlaidPassword){
            logger.warn("Incorrect password")
            return res.status(400).json({
                message:"incorrect password",
                success:false
            })
        }
        const {accessToken,refreshToken}=await generateToken(user);

        res.json({
            accessToken,
            refreshToken,
            userId:user._id,
            message:"user loggedin successfully",
            success:true
        }
        )
    } catch (error) {
        logger.error("loggin error occured",error)
        res.status(500).json({
            message:"internal server error",
            success:false
        })
    }

}
const userLogout=async(req,res)=>{

    await User.findByIdAndUpdate(req.user._id,{
        $set:{refreshToken:undefined},
        new:true
    })
    

}
const refreshAccessToken=async(req,res)=>{

   try {
     const {refreshToken}=req.body;
 
     if(!refreshToken){
         logger.warn("Invalid refresh token")
         return res.status(401).json({
             message:"Invalid refresh token", 
             success:false
         })
     }
     const user=await User.findById(refreshToken._id);
     if(!user){
         logger.warn("user not exist")
         return res.status(404).json({
             message:"user not found",
             success:false
         })
     }
 
     const {accessToken:newAccessToken,refreshToken:newRefreshToken}=await generateToken(user);
     
     res.status(200).json({
         accessToken:newAccessToken,
         refreshToken:newRefreshToken,
         message:"refresh token generated successfully",
         success:true
     })
   } catch (error) {
        logger.warn("internal server error",error)
        res.status(500).json({
            message:"internal server error",
            success:false
        })
   }


}


module.exports={userRegistration,userLogin,refreshAccessToken}
