const jwt=require('jsonwebtoken');
const crypto=require('crypto')

const generateToken=async(user)=>{

    const accessToken=jwt.sign(
        {id:user._id,email:user.email},
        process.env.JWT_SECRET,
        {expiresIn:'60m'}
    )
    const refreshToken=crypto.randomBytes(40).toString('hex');

    const expireAt=new Date();
    expireAt.setDate(expireAt.getDate()+7)       //refresh token expired in 7 days

    return {refreshToken,accessToken}
}
module.exports=generateToken;