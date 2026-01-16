const {uploadMedia,getAllMedia}= require('../controller/mediaController');
const authenticateUser = require('../middleware/authMiddleware');
const router=require('express').Router();
const multer=require('multer');

const upload=multer({
    storage:multer.memoryStorage(),
    limits:{
    fileSize:5*1024*1024
    }
}).single('file')

router.post('/upload',authenticateUser,upload,uploadMedia);
router.get('/getAllMedia',authenticateUser,getAllMedia);
module.exports=router