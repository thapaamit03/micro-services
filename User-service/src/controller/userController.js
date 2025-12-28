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
                message:error.details[0].message,
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

module.exports={userRegistration,userLogin}
