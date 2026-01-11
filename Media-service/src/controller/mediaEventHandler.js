const Media = require("../models/Media");
const { deleteMediaFromCloudinary } = require("../utils/cloudinary");
const logger = require("../utils/logger");

const handledPostDeleted = async (event) => {
  console.log(event, "event event event ");
  
  const { postId, mediasIds } = event;
  try {
    const mediaTodelete = await Media.find({ _id: { $in: mediasIds } });
   
    await Promise.all(
        mediaTodelete.map(async(media)=>{

            await deleteMediaFromCloudinary(media.publicId);
            await Media.findByIdAndDelete(media._id);
            logger.info( `deleted media ${media._id} associated with this deleted post: ${postId} `);
        })
    )
    logger.info(`Deletion of media for post: ${postId} is completed`)
  } catch (error) {
    logger.error("errro while deleting media", error);
  }
};
module.exports = handledPostDeleted;
