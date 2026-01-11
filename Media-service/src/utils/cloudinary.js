const cloudinary=require('cloudinary').v2
const logger=require('./logger')
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key:process.env.API_KEY,
    api_secret:process.env.API_SECRET,
}
)


const uploadToCloudinary=async(file)=>{
    return new Promise ((resolve,reject)=>{
          const uploadStream=cloudinary.uploader.upload_stream(
            {resource_type:'auto'},
            (error,result)=>{
                if(error){
                    logger.error("erro while uploading to cloudinary",error)
                    reject(error)
                }else{
                    resolve(result)
                }
            }
          )     //file.buffer receive file in memory
          uploadStream.end(file.buffer) //sends file buffer into upload stream 
    })                                  //without this upload never happens
  
}

const deleteMediaFromCloudinary=async(publicId)=>{
    
  try {
     const result= await cloudinary.uploader.destroy(publicId);
     logger.info("Media deleted from cloud storage",publicId);
     return result;
  } catch (error) {
    logger.error("error while deleting from cloudinary",error)
    throw error;
  }
}

module.exports={uploadToCloudinary,deleteMediaFromCloudinary}