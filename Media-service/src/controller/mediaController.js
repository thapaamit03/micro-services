
const Media = require("../models/Media");
const {uploadToCloudinary} = require("../utils/cloudinary");
const logger = require("../utils/logger")

const uploadMedia=async(req,res)=>{
try {
    
        logger.info("starting media upload")
    
        if(!req.file){
            logger.warn("file is required");
            return res.status(400).json({
                message:"Media file is required",
                success:false
            })
        }
    console.log(req.file);
    
        const{originalname,mimetype}=req.file;
        const userId=req.user.userId
        logger.info(`Original name ${originalname} and mimeType ${mimetype}`)
        
        const{secure_url,public_id}=await uploadToCloudinary(req.file);
        console.log(secure_url,public_id);
        
        const newlyCreatedMedia=await Media.create({
            originalName:originalname,
            mimeType:mimetype,
            mediaUrl:secure_url,
            publicId:public_id,
            userId
        })
        res.status(200).json({
            message:"Media uploaded successfully",
            success:true,
            mediaId:newlyCreatedMedia._id,
            url:newlyCreatedMedia.mediaUrl
        })
} catch (error) {
        logger.error("internal server error",error)
        res.status(500).json({
            success:false,
            message:"internal server error"
        })
}
}

const getAllMedia=async(req,res)=>{
    try {
        const medias=await Media.find({});
        res.status(200).json({medias})
    } catch (error) {
        logger.error("error while fetching medias ",error)
    }
}
module.exports={uploadMedia,getAllMedia};
